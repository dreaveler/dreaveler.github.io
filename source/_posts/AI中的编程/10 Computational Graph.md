---
title: "10 Computational Graph"
date: "2025-11-28"
number: 1
categories:
  - 课程笔记
  - AI中的编程
tags:
  - AI中的编程
  - Notion 同步
permalink: "/notes/AI中的编程/10 Computational Graph/"
banner_img: /images/banners/moon-horizon.jpg
category_bar: true
math: true
---

> 从本人 Notion 的大二上笔记同步；原始整理状态：进行中。

# 什么是计算图
是一个DAG，节点代表的是运算符，边代表的是数据流
运算符有多种可能
- 向量运算，reshape concat matmul
- 网络运算，计算loss，求导等
- 数据管理，batch等
- 控制流运算符：if/else
Tensor也有不同表现形式，高维数组 离散向量等
计算图表现出的了运算符与运算符之间的依赖
- 如果运算符A直接利用运算符B的结果 那么它们两个之间有一条直接的边
- 如果A依赖于B 例如A与B有同一个GPU缓存 那么它们之间有一条特殊的依赖边
- else  A与B独立
特殊的依赖边对于计算图的分发是很有用的


同样，运算符也有特殊的一种 即控制流运算符
它的重要性在于
- 后端的本地化支持
- 前端控制流语言的复用
- 后端的解析控制流
# 如何建图
## **Imperative Programming - 命令式编程  动态图**
它是pytorch的0.x与1.x版本的实现
在每个iter中：
- 重新记录连接信息
- 重新建立计算图用于前向计算与反向AD
pros：
- 灵活
- 轻松的支持控制流
- 很容易debug
cons：
- 计算图的迭代是time-consuming的
- 优化图是较为困难的
## **Declarative Programming - 声明式  静态图**
它是tensorflow的0.x与1.x版本的实现方法
先生成图的中间表示 然后反复运行：
- 记录所有的运算符
- Session()函数：分析并建立静态图
- 在for loop中运行session().run()函数去运行这个图
pros：
- 可以非常有效率的
- 对于图的优化和实施是很方便的
cons：
- 不灵活
- 很难支持控制流
## **The Fuse of Dynamic and Static Graphs**
### 比较这两种图
![](/images/notes/AI中的编程/e2e4eaabff29-01.png)
### 融合动态图与静态图
显然这两种图都有各自的优点，那么我们考虑将其融合，使之既具有静态图的性能，又有动态图的灵活性，而思路就是以命令式编程的灵活性为主，以函数式编程的优化方式相结合
coding与debugging我们使用动态图，而实施使用静态图，由动态子图到静态图的转变通过函数式编程，也就是说，在全局上，我们使用该动态图，而在子图上，我们使用静态图。
函数式编程，也称为Graph Capture，它是声明式编程的子集，它使用前端语言，但只允许函数求值，有两种实现方式：
- Trace based
- AST-based
