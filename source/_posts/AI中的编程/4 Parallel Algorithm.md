---
title: "4 Parallel Algorithm"
date: "2025-09-18"
number: 4
categories:
  - 课程笔记
  - AI中的编程
tags:
  - AI中的编程
  - Notion 同步
permalink: "/notes/AI中的编程/4 Parallel Algorithm/"
banner_img: /images/banners/moon-horizon.jpg
category_bar: true
math: true
---

> 从本人 Notion 的大二上笔记同步；原始整理状态：进行中。

# Reduce
我们需要并行的对一个数组进行求和 这可以用来计算平均值等操作 而平均值对于Normalization是有用的
如果我们在CPU上线性计算 它的work/step complexity都是O(N)
而如果我们并行计算
可以以一种二叉树的方式进行计算
这时work 是O(N)   step是O(logN)
## Interleaved Addressing
![](/images/notes/AI中的编程/f2707499446e-01.png)
这种实现方式有一个问题是访问内存不是连续的  会降低速度
## Sequential Addressing
![](/images/notes/AI中的编程/f2707499446e-02.png)


以及对于数组长度过长超出block时   就需要在block内先实现  然后再把不同block的内容提取出来到一个block中进行计算 以此类推
## 代码实现
![](/images/notes/AI中的编程/f2707499446e-03.png)
```c++
s>>=1    //这里是s右移一位  即除2取整
```
![](/images/notes/AI中的编程/f2707499446e-04.png)
通过使用shared memory 来进行提速
![](/images/notes/AI中的编程/f2707499446e-05.png)
总的redeuce函数
```javascript
#pragma once
```
这个语句写在for循环前可以将for循环展开 避免分支判断 可以提高一点效率 但是需要起始位置与每次的加减是整数
需要注意的是 reduce可能会带来误差  原因也很简单 就是大数加小数可能会直接把小数抹掉
# Scan
- Inclusive scan  包含自己的前i个元素之和
- exclusive scan  不包含自己的前i个元素之和(前i-1)
scan是并行操作中很重要的一种操作 可以让无法并行的操作并行
在CPU上的做法是简单的 不断加下一项并赋值即可  但它的work和step complexity都是O(N)的
## GPU上的做法
理论上来说我们可以反复做reduce即可得到结果  但这样的work complexity是O(N\^2)的
有另一种做法是
![](/images/notes/AI中的编程/f2707499446e-06.png)
![](/images/notes/AI中的编程/f2707499446e-07.png)
这两种scan可以根据GPU计算能力以及数组长度来选择
## Parallel Compact
```python
import torch

a = torch.rand(5,2)
b = torch.tensor([1,0,0,1,0],dtype=bool)
c = a[b]
```
这就是torch中的compact操作
对b进行一次scan 得到值  对于每一个值最后出现的idx提取到output里
# Transpose
一个kernel处理一行  kernel内保存一轮循环
