---
title: "7 Convolution and Pooling"
date: "2025-10-23"
number: 7
categories:
  - 课程笔记
  - AI中的编程
tags:
  - AI中的编程
  - Notion 同步
permalink: "/notes/AI中的编程/7 Convolution and Pooling/"
banner_img: /images/banners/moon-horizon.jpg
category_bar: true
math: true
---

> 从本人 Notion 的大二上笔记同步；原始整理状态：进行中。

# Conv
卷积层
它是平移等变形的  输入的平移只会导致特征值的shift
边界效应
- 忽视
- 0padding
- 复制padding
- refelct
是可以具有stride的  以及可以是grouped的
转换为稀疏矩阵的部分可以看cv导的tensor化的编程
对于一维的卷积 我们可以把W或X扩充为矩阵  这样可以实现线性化
这样的话就会使得卷积可以通过gemm来实现  但会消耗大量内存
### Implicit gemm
我们”假定”矩阵已经存在
在把数据由global memory加载到shared memory时 动态地形成卷积瓦片  数据在瓦片上按照GEMM计算所需的内存布局进行排列  相当于动态地构建了im2rol矩阵的一个小瓦片
由于本身是临时性的 用完即弃 因此不会导致显存爆炸
并利用现有的warp级gemm组件累加卷积结果并输出张量
