---
title: "5 Parallel Algorithm 2"
date: "2025-09-25"
number: 5
categories:
  - 课程笔记
  - AI中的编程
tags:
  - AI中的编程
  - Notion 同步
permalink: "/notes/AI中的编程/5 Parallel Algorithm 2/"
banner_img: /images/banners/moon-horizon.jpg
category_bar: true
math: true
---

> 从本人 Notion 的大二上笔记同步；原始整理状态：进行中。

# Sort
## Brick Sort 冒泡排序
操作不用多说  $O(N^2)$
一个并行编程中的思想就是把一个大数组拆分为许多没有关系的小数组 进行并行的计算
而在GPU上 进行冒泡排序 我们就可以采用这种方式  而这样最后的step complexity可以是 $O(N)$
![](/images/notes/AI中的编程/cfc2e65e3634-01.png)
## Merge sort 归并排序
分 治 和
```c++
void merge_sort(int *arr, int left, int right) {
	if (left < right) {
		int mid = (left + right) / 2;
		merge_sort(arr, left, mid);
		merge_sort(arr, mid + 1, right);
		merge(arr, left, mid, right);
	}
}
```
而merge操作的实现就是用两个指针 分别指向两个数组的头部 提取出小的那个并把这个指针指向现在的头 继续进行比较  时间复杂度为 $O(N)$
而整个操作的时间复杂度为 $O(NlogN)$
### 在GPU上操作
首先对于CUDA来说，根本无法实现递归
但是我们可以把递归转化为非递归的迭代程序，那么我们可以使用自底而上的操作
但值得注意的是对于一个很大的数组来说，分为三个阶段
- 起初对于规模极小的子问题来说，把一个merge分配到一个thread上
- 后来对于规模较小的子问题来说，把一个merge分配到一个block上
	- 使用shared memory同时使用二分查找
- 最后对于规模很大的问题来说，把一个merge分配到几个block上
	- 应当把大问题转化为小问题
有 $O(logN)$的stages
# Sorting Networks
这样的一个网络是由数字代表的线之间的比较器组成
一个比较器可以对输入的两个数进行比较并输出
比较器的深度
- 对于有直接输入的比较器  它的深度为0
- 对于其余的比较器 他的深度是输入的线的深度的最大值+1
