---
title: "9 Auto Diff"
date: "2025-10-23"
number: 9
categories:
  - 课程笔记
  - AI中的编程
tags:
  - AI中的编程
  - Notion 同步
permalink: "/notes/AI中的编程/9 Auto Diff/"
banner_img: /images/banners/moon-horizon.jpg
category_bar: true
math: true
---

> 从本人 Notion 的大二上笔记同步；原始整理状态：完成。

# Fundamentals in AI Frameworks
AI的框架希望：
网络可以快速的搭建  自动微分  数据管理与操作  模型训练
结构：
编程接口
计算图 中间层核心概念
编译器前端   数据处理   梯度下降优化
编译器后端    分布式训练与部署
异构处理器


# Deep learning核心：微分/求导
自动微分
手动微分
符号微分：在表达式不复杂时，可以利用python中的sympy来进行微分
数值微分：
当$\epsilon$不够小 截断误差
当$\epsilon$过小  对于float类型 会是过小的
符号微分是对函数的解析表达式进行精确求导，得到新的符号公式；数值微分是通过计算函数在某点的数值变化来近似求导，不返回公式，只得到某点的梯度值。
## 自动微分：
前提：
所有数值计算都由有限的基本运算组成
基本运算的导数表达式是已知的
思路：
通过链式微分讲数值计算各个部分组合成整体
通过计算图进行链式法则的迭代(前向迭代/后向迭代)


将一个原函数转换为有向无环图  根据链式求导法则展开
```python
def gradient(out):
	node_to_grad = {out:[1]}

	for i in reverse_topo_order(out):
		vi = sum(node_to_grad[i])
		for k in inputs(i):
			node_to_grad[k].append(vi*(dvi/dvk))
	return vinput
```


## Forward AD
前向模式下的AD  本质上是同时计算函数值和沿某输入方向的导数（JVP）；设置“某个变量的 tangent=1、其他=0”只是选择一个方向向量来得到 Jacobian 的某一列 也即y对xi的导数
其操作方式是对输入求解 那么得到的y就是对这个方向的Jacobian矩阵
这个输入可以是任何值 但是如果需要获得对每个xi的导数 就需要使用one-hot向量将所有xi遍历一遍
这样对于输入量巨大的神经网络 这样求解微分也是不划算的
## Reverse AD
与熟悉的反向传播计算导数一致 对于有不同分路的情况 分开计算不同分路并在结点处将其加和
其实现机理是不断扩充计算图 而不是手写一个reverse mode出来
在构造好 forward 图之后，由于 forward 中包含了如何计算每个中间变量的信息，我把这些信息保存在图的节点中。Backward 时，通过链式法则读取这些信息，沿着图反向传播梯度。
这样做的好处是有了可复用性 且在需要求高阶导数时可以再调用AD来求解 并且可以使得编译器自动优化


### Summary – Reverse Mode AD for Tensors
1. 反向模式自动微分不仅适用于标量，也适用于向量和张量。
2. 对矩阵/张量操作（如 matmul）进行反向传播时：
	- 局部导数变为矩阵形式
	- 链式法则变成矩阵乘法
3. 矩阵乘法 Z = XW 的反向传播公式：
	- 对输入 X：
		$\bar{X} = \bar{Z} W^T$
	- 对权重 W：
		$\bar{W} = X^T \bar{Z}$
4. 这页的重点是展示“标量 AD 推广到张量 AD”的方式：
	- 继续用链式法则
	- 但梯度变成张量/矩阵
	- 最终依靠矩阵乘法来实现
5. 这是现代深度学习框架（PyTorch/JAX/TF）实现高效梯度计算的关键：<br>让反向传播退化为一系列常规的矩阵运算。


同样的 AD可以推广到任意数据结构 只要能够定义它的局部反向传播规则
## forward Mode vs reverse Mode
对于一个f  它的输入有n个变量  输出有m个元素
那么它的Jacobian矩阵存储了它的偏导信息
而forward是每次计算矩阵的一列  reverse是计算矩阵的一行
因此想要得到完成矩阵 对于forward 就需要运行n次  reverse 需要运行m次
因此对于神经网络的训练来说 reverse显然更加高效


**Forward Mode AD**
- 计算：Jv（Jacobian–vector product）
- 次数 ∝ 输入维度 n
- 优势：输入维度小、输出维度大时效率高
- 用途：科学计算、方程 sensitivity analysis
**Reverse Mode AD**
- 计算：vTJ（vector–Jacobian product）
- 次数 ∝ 输出维度 m
- 优势：输出维度小（例如 scalar loss）时效率最高
- 用途：深度学习训练（几乎全部）
> 神经网络梯度用 reverse mode，就是因为我们要对数百万参数求梯度，而输出只有一个 loss 标量。
# OO Operator Overload
为了实现自动构建计算图 可以对tensor的运算进行运算符重载
对于每一次计算 都会触发：
- 计算新的tensor结点
- 记录对应的Op
- 记录输入结点(构图）
- 保存反向传播所需的信息
eg
```python
class Tensor:
    def __mul__(self, other):
        out = Tensor(self.value * other.value)
        out.grad_fn = MulBackward(self, other)
        return out

```
通过这种方式重构了tensor类的乘法 就可以完成上述的需求
当然也是有优缺点的
优点
- 实现简单
- 语言具备多态性
- 易用性高，贴合原生语言
缺点
- 显式的构造 Tape 数据结构和对 Tape 进行读写
- 构建计算图需要额外数据结构和操作，不利于高阶微分（随阶数指数增长的计算图）
- if，while 等控制流表达式，通常难以通过操作符重载，导致计算图无法复用
