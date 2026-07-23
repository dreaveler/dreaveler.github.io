---
title: "3 Parallel Communication"
date: "2025-09-18"
number: 3
categories:
  - 课程笔记
  - AI中的编程
tags:
  - AI中的编程
  - Notion 同步
permalink: "/notes/AI中的编程/3 Parallel Communication/"
banner_img: /images/banners/moon-horizon.jpg
category_bar: true
math: true
---

> 从本人 Notion 的大二上笔记同步；原始整理状态：完成。

# Thread Blocks
## Thread blocks and Programmers
kernels — C/C++ functions(__global_ _)
threads    threads组成block
threads blocks: groups of threads that cooperate to solve a subproblem
不同的threads blocks用来解决不同的问题
## Thread blocks and GPU Hardware
一个thread对应一个GPU core
在一个threads block中  形成streaming Multiprocessor  其中拥有 memory register  对应shared memory
而很多个block组成gpu  其中也拥有很大一块内存  对应global memory
## summary of thread blocks
程序员对定义block负责
GPU对block在SM中运算负责
CUDA对thread blocks的计算限制很少 在block之间没有交流


由于block之间只是并行计算   所以对于顺序没有要求与同步
thread也同理  但是thread间有线程束因此有隐形的顺序在
## SIMT——single-Instruction Multiple-Thread
在线程中有16/32个线程的逻辑硬件完全相同 因此存在隐性的并行 而这称为线程束
可以利用这种线程束的机制来提升速度
Branch diverse 即条件分支是我们不希望在GPU中看到的  我们以为它可以并行进行
但实际上是先执行if分支 而else分支会一直等待到if结束
for分支也是这样  必须所偶有调用的分支完成后才能继续
# Synchronization and Parallel Patterns
## Thread Synchronization
线程之间互相依赖时就需要同步
最简单的同步机制称为Barrier 栅栏: 即让执行的快的线程等一等  直到所有的线程同步
### 可以利用barrier避免数据竞争
```c++
const int N = 128;
```
```c++
__global__ void shift_sum(float* array) {
// do the "shift and sum"
int idx = threadIdx.x;
if (idx < N-1) {    // !!! possible BUG
array[idx] = array[idx] + array[idx+1];
}
}
```
```c++
__global__ void shift_sum(float* array) {
// do the "shift and sum"
int idx = threadIdx.x;
if (idx < N-1) {
float tmp = array[idx] + array[idx+1];
__syncthreads();
array[idx] = tmp;
}
}
```
### 可以使用shared memory
```c++
__global__ void shift_sum(float* array) {
// shared memory can be accessed
// by all threads in the block.
__shared__ float shared[N];
// fill the shared memory
int idx = threadIdx.x;
shared[idx] = array[idx];
__syncthreads();
// do the "shift and sum"
if (idx < N - 1) {
array[idx] = shared[idx] + shared[idx + 1];
}
// the following code has NO EFFECT
shared[idx] = 3.14f;
}
```
相比于上面的代码，这里对于global memory只用了1次读  而上面对于global读了2次  这就是性能的提升
## 原子操作
```c++
atomicAdd  atomicMin   atomicCAS
```
原子操作就是在一个线程开始对内存操作之后使得其它线程不能对内存操作 直到它的操作完成
### 原子操作的限制
对于原子操作 它不能保证操作的顺序  使得有时结果不可复现
以及由于它的操作会使得并行变为串行  使得耗时变多
## Measure speed
在cpu上测速  可以调用ctime库  获取时间
之所以CPU和GPU的测速方式不同是因为CPU和GPU是异步的
在GPU上测速
```c++
cudaEvent_t start = cudaEventCreate(&start);
cudaEvent_t stop = cudaEventCreate(&stop);
cudaEventRecord(start, 0);
///////////////////////////////
// put your CUDA kernel here //
///////////////////////////////
cudaEventRecord(stop, 0);
cudaEventSynchronize(stop);
float elapsed;
cudaEventElapsedTime(&elapsed, start, stop);
cudaEventDestroy(start);
cudaEventDestroy(stop);
```
当然由于同样存在create以及destroy  可以进行封装
pytorch中也有对应的内容
# Communication patterns
## map: One - to - one
由一个具体的内存地址读写
激活函数就是一种map
## Gather: Many-to-one
多对一  立即联想到卷积
## Scatter : One-to-many
由一个地方读 写到多个地方
## Stencil
由一个固定的邻域进行读  是一种特殊的Gather
## Transpose
是一种特殊的map
对于数据结构也可以进行transpose
