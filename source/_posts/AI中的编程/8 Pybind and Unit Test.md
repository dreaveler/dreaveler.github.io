---
title: "8 Pybind and Unit Test"
date: "2025-10-22"
number: 8
categories:
  - 课程笔记
  - AI中的编程
tags:
  - AI中的编程
  - Notion 同步
permalink: "/notes/AI中的编程/8 Pybind and Unit Test/"
banner_img: /images/banners/moon-horizon.jpg
category_bar: true
math: true
---

> 从本人 Notion 的大二上笔记同步；原始整理状态：进行中。

# Pybind 11
python作为高层通用的编程语言  便于快速开发  增加灵活性
pybind是一个轻量化的仅头文件的C++库
安装：
仅需要clone下来  然后把头文件链接进来即可
或者可以pip下来


可以通过PYBIND11_MODULE定义 pybind module
编译时可以使用cmake/setup.py


# 单元测试
黑盒测试：软设讲的全多了


python中的：
继承这个类   unittest.TestCase     在测试函数名字前加上test_
可以用self.assertEqual
setup函数：在每一个test方法前run  自动赋值
teardown函数：在每一个test方法后run  可以用来delete
