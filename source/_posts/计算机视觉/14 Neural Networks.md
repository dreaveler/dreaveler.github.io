---
title: "14 Neural Networks"
date: "2025-12-15"
number: 14
categories:
  - 课程笔记
  - 计算机视觉
tags:
  - 计算机视觉
  - Notion 同步
permalink: "/notes/计算机视觉/14 Neural Networks/"
banner_img: /images/banners/lake-night.jpg
category_bar: true
math: true
---

> 从本人 Notion 的大二上笔记同步；原始整理状态：完成。

由于线性分类器的使用是受限的 因为它对空间中的非线性不可分
改进想法1：提取高维特征  使用线性分类器
就比如我们可以使用HoG算子提取特征并施加到线性分类器
高维压缩for线性分类器
- 将各种高维特征拼接到一个向量 越高维越好
- 用PCA(主成分分析 之前讲到过)和提取fisher vector来进行维度的压缩
- 每个类别训练一个 **线性 SVM **用 **SGD** 训练 多分类用 **one-vs-all**
- 上述实现获得了2011年的ImageNet分类的冠军 在AlexNet之前
# Neural Networks
**M i n s k y and Papert**发布了一篇文章为多个感知机 并表明单层感知器甚至无法解决简单物体 因此引发了AI寒冬
仿照生物的神经元结构 我们提出了多层感知机 MLP
而至少有一个隐藏层的多层感知器可以拟合为任何的方程
![](/images/notes/计算机视觉/d8a4a48c7118-01.png)
(这里不写了  把图截过来就完了 应该都会)
激活函数是必不可少的是因为没有的话就退化为线性层了  可微的是因为要能更新w
ReLU可以作为默认的激活函数选择


视觉角度去看：MLP是在第一层完成很多模式的激活 第二层完成不同模式的组合与匹配
几何角度去看：允许非线性的边界


MLP的限制：网络过深时可能难以拟合等
