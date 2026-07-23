---
title: "15 Back Propagation"
date: "2025-12-15"
number: 15
categories:
  - 课程笔记
  - 计算机视觉
tags:
  - 计算机视觉
  - Notion 同步
permalink: "/notes/计算机视觉/15 Back Propagation/"
banner_img: /images/banners/lake-night.jpg
category_bar: true
math: true
---

> 从本人 Notion 的大二上笔记同步；原始整理状态：完成。

我们如何优化参数
一种方法是Grid Search：也即遍历所有的可能并得到最好的结果
好处是只需要评估模型  缺陷也是明显的
一种方法是随机搜索：好处同上 缺陷是可能找不到最优解
但并不是说这两种方法不能用
当参数的维度很小 边界确定 函数是难以分析时 我们可以用这些方法
随机搜索可以与其它方法结合


而最为熟悉也常用的方法是沿梯度下降
# 梯度下降
每一步沿梯度方向反向前进一个lr
lr是一个关键的超参
## lr schedule
想法是起始时lr高 越往后lr越小
stepwise decay：在一些固定的iterations处减小
Cosine Decay：以cos函数形式减小 $\alpha_t=\frac{1}{2}\,\alpha_0\left(1 + \cos\!\left(\frac{t\pi}{T}\right)\right)$
## 如何微分
以计算图的形式Auto Diff  详情请见AIPro
它可以扩展至tensor类   当输入为tensor  输出也为tensor时 那么求导得到的是一个雅可比矩阵
