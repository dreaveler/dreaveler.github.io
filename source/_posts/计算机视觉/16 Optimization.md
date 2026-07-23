---
title: "16 Optimization"
date: "2025-12-15"
number: 16
categories:
  - 课程笔记
  - 计算机视觉
tags:
  - 计算机视觉
  - Notion 同步
permalink: "/notes/计算机视觉/16 Optimization/"
banner_img: /images/banners/lake-night.jpg
category_bar: true
math: true
---

> 从本人 Notion 的大二上笔记同步；原始整理状态：完成。

# **Stochastic Gradient Descent ： SGD**
由于计算loss时 如果一次性将所有数据完成计算 当N很大时总和的开销是很大的  因此我们使用mini-batch的方法 每次进行小批次的计算
### SGD的问题
- 当出现一个方向的导数值很大但另一个方向上导数值很小时  w会在导数值很大的方向上极具抖动而另一个方向却进展缓慢 导致收敛慢
- 由于B\<\<N  因此batch中的数据噪声会引起梯度方向的扰动
- 当抵达local minima/鞍点时 SGD会卡住
### 改进
引入动量
在计算 $v_{t+1}$时 $v_{t+1} = \rho v_t + \nabla L(w_t)$   保留上次的一部分速度  $\rho$一般设为0.9  $w-=lr*v_{t+1}$
通过这种方式 高频的噪声梯度会逐渐抵消 只留下稳定的梯度方向
上述实现方式是pytorch中的实现方式
还有一种等价的tensorflow的实现方式为：
$$
\begin{aligned}v_{t+1} &= \rho\, v_t - \alpha \nabla L(w_t), \\w_{t+1} &= w_t + v_{t+1}\end{aligned}
$$
## Nesterov Momentum
普通的动量计算方式是在原地计算导数并更新速度  nesterov是在先以先前速度走一小步再在该位置更新梯度并更新速度
实现方式为：
$$
\begin{aligned}v_{t+1} &= \rho\, v_t - \alpha \nabla L\!\left(w_t + \rho\, v_t\right), \\w_{t+1} &= w_t + v_{t+1}\end{aligned}
$$
这种实现方式可能收敛的更快 但当lr过大时 会导致overshoot
# Adaptive Learning Rate Methods
### AdaGrad
为每个参数维护了自己维度上的梯度平方和 用这个平方和的平方根来调整学习率 也就是说历史梯度较大的会用更小的lr来调整 适用于稀疏梯度场景 但会导致后续历史梯度过大时 几乎无法前进
```python
grad_squared = 0.0

for t in range(num_steps):
    dw = compute_gradient(w)
    grad_squared += dw * dw
    w -= learning_rate * dw / (grad_squared**0.5 + 1e-7)
```
### RMSProp
一个在不断泄露的AdaGrad  避免了梯度平方和过大
```python
grad_squared = 0.0

for t in range(num_steps):
    dw = compute_gradient(w)
    grad_squared = decay_rate * grad_squared + (1 - decay_rate) * dw * dw
    w -= learning_rate * dw / (grad_squared**0.5 + 1e-7)
```
## Adam：RMSProp + momentum
```python
moment1 = 0.0
moment2 = 0.0

for t in range(1, num_steps + 1):  # start at t = 1
    dw = compute_gradient(w)

    # Momentum (first moment)
    moment1 = beta1 * moment1 + (1 - beta1) * dw

    # RMSProp (second moment)
    moment2 = beta2 * moment2 + (1 - beta2) * (dw * dw)

    # Parameter update
    w -= learning_rate * moment1 / (moment2**0.5 + 1e-7)
```
如上述所示 就是将动量与RMSProp结合起来
但如果这样实现 在迭代初期 mement2会是一个极小值 这会导致数值的不稳定(beta2一般取0.999)
因此我们对其进行偏置矫正 也就是对向量/beta的t次方
矫正过后的代码如下：
```python
moment1 = 0.0
moment2 = 0.0

for t in range(1, num_steps + 1):  # start at t = 1
    dw = compute_gradient(w)

    # First moment (Momentum)
    moment1 = beta1 * moment1 + (1 - beta1) * dw

    # Second moment (RMSProp)
    moment2 = beta2 * moment2 + (1 - beta2) * (dw * dw)

    # Bias correction
    moment1_unbias = moment1 / (1 - beta1**t)
    moment2_unbias = moment2 / (1 - beta2**t)

    # Parameter update
    w -= learning_rate * moment1_unbias / (moment2_unbias**0.5 + 1e-7)
```
Adam时非常常用的  但很长一段时间 SGD with momentum的效果是好于Adam的


由于Adam中对梯度的归一化 L2正则化不再等价于weight decay  会削弱权重衰减效果  因此提出AdamW  把weight decay在参数更新中解耦 其实现优于Adam
AdamW应成为优化器的默认选择
### Muon方法
Adam存在两个问题：二阶矩带来的大内存、且独立地对每个参数做归一化
Muon 丢弃二阶矩以节省内存，并通过矩阵正交化（用 Newton–Schulz 方法把参数矩阵做近似正交化，相当于 SVD 把奇异值拉到 1）来做归一化处理。
## 二阶方法
前面的所有方法都是只利用了一阶导的方法
二阶法：牛顿法
用梯度和 Hessian 做二阶泰勒展开并求临界点，能在低曲率方向迈大步
但Hessian矩阵有$O(n^2)$个元素 求逆要$O(N^3)$  因此对于DNN不适用
![](/images/notes/计算机视觉/d6f711a5a4e4-01.png)


### L-BFGS
![](/images/notes/计算机视觉/d6f711a5a4e4-02.png)
