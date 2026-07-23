---
title: "6 Matrix Product"
date: "2025-10-09"
number: 6
categories:
  - 课程笔记
  - AI中的编程
tags:
  - AI中的编程
  - Notion 同步
permalink: "/notes/AI中的编程/6 Matrix Product/"
banner_img: /images/banners/moon-horizon.jpg
category_bar: true
math: true
---

> 从本人 Notion 的大二上笔记同步；原始整理状态：完成。

# Matrix Product
矩阵乘的重要性不必多提
我们要实现一个更通用的矩阵乘 General matrix multiplication(gemm) ： $C = \alpha A \times B + \beta C$
在CPU上实现 只需要通过for loop完成嵌套循环即可
在GPU上实现时 每一个kernel对应C的一个元素
![](/images/notes/AI中的编程/d3cf6ba7e776-01.png)
通过计算得到row和col  然后进行计算即可
对于量化细分坐标的过程中  由于我们先初始化一个grid  有大量的thread是闲置的
![](/images/notes/AI中的编程/d3cf6ba7e776-02.png)
以上是thread的分布方式   对于一个block中的thread  先增长x  然后y  最后z   z相同意味着位于一个线程束内  我们通过这种方式对内存的访问进行分析
这种实现方式 尽管对于每个thread  它的访问是连续的  但对于计算出的结果存储于C时  对于thread的访问是跳跃的  虽然不是random的  但我们还是希望它能够是连续的
那么实际的实现部分  我们就需要注意行列的实现方式  将其转置即可
![](/images/notes/AI中的编程/d3cf6ba7e776-03.png)
当然CUDA自己提供了版本  目前的实现方式仅能达到其8%
### Roofline性能模型
我们可以把程序计算速度的限制分为两种：带宽限制  计算限制
由于GPU的计算速度很快  主要的限制常常是带宽限制  很多的thread在等数据的时间上很长  因此可以考虑用shared memory来加速计算
在之前的实现方法中 对于不同的矩阵块  每次读写都需要达到global memory中  使用shared memory可以加速读取  我们每次提取一部分A和B的数据到shared memory中 并进行计算
![](/images/notes/AI中的编程/d3cf6ba7e776-04.png)
![](/images/notes/AI中的编程/d3cf6ba7e776-05.png)
# 稀疏矩阵乘法
稀疏矩阵有两种表达方式
- Coordinate list  COO
	- 把所有的稀疏矩阵中的所有值以及它的row/col idx列出来
- Compressed sparse row  CSR CRS
	- 列出值 对应的row idx   对应的col  idx进行合并
可以利用pytorch来进行生成
稀疏矩阵向量乘可以通过：先进行map 即每个元素与向量对应列元素相乘 再按行分段做前缀和来完成
每段的最后一个value就是结果  这就是如何利用并行化加速计算
# CUDA linear algebra and math libraries
## Thrust
是CUDA的GPU上的STL库   有host_vector和 device_vector  提供了丰富的并行算法  如 scan reduce  sort .etc
![](/images/notes/AI中的编程/d3cf6ba7e776-06.png)
我们可以用thrust中的transform完成map操作  (即对每个元素采取相同的操作)
```c++
thrust::transform(X.begin(),X.end(),Y.begin(),thrust::negate<int>())
```
这里就是令Y = -X
与在C++中类似 可以自己定义一个类 来进行操作
![](/images/notes/AI中的编程/d3cf6ba7e776-07.png)
而scan reduce  sort 也可以通过调用函数来完成
![](/images/notes/AI中的编程/d3cf6ba7e776-08.png)
## cuBLAS
可以通过它来计算矩阵的线性计算
![](/images/notes/AI中的编程/d3cf6ba7e776-09.png)
## FC
![](/images/notes/AI中的编程/d3cf6ba7e776-10.png)
