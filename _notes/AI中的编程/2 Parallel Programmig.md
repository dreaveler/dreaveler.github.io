---
number: 2
title: "2 Parallel Programming"
subject: AI中的编程
date: 2025-9-11
---
# Thr Reason of Parallel Programming
如何快速计算一个激活函数？  
- 在每个时间循环内算的更快  不现实
- 把任务划分，并行计算

近期，CPU的频率以及达到了平台期。且哪怕说频率可以 比那块，也需要更多能量，会给散热带来困难  
CPU的unit也在不断增加  

## CPU vs GPU
### CPU
- 复杂计算 
- 灵活性与表现上更好  
- power上更加昂贵
- 优化的目标是计算速度

### GPU
- 简单的核  
- 有更多的核用于并行计算  
- 更好的能效  
- 较低的灵活性
- 优化的目标是吞吐量 单个unit的计算可能不如CPU

## CUDA
CUDA编译器把一个CUDA编译项目进两个部分，一个在CPU上跑，一个在GPU上跑  
CPU：Host 用于发出指令  
GPU：Device  用于干活计算 把结果传回CPU  
都有memory   
- Data: CPU -> GPU
- Data: GPU -> CPU
- CudaMalloc (对应C里的Malloc发配内存)
- Launch kernels on GPUs

### A typical CUDA Program
CPU和GPU异步执行
CPU:
- cudaMalloc:CPU在GPU上开辟内存
- cudaMemcpy：把数据从CPU传到GPU
- Launch kernels <<<,>>>：初始化kernels
- cudaMemcpy：把数据从GPU传回CPU

GPU：
- 初始化kernels
- 一个kernel看起来像一个thread
- GPU跑很多个kernel

# The First CUDA Program
先来看看relu是怎么实现的
```C
float relu_cpu(float x){
    return x > 0 ? x : 0;
}
```
对于一个数组的数来说
```C
for (int i = 0 ; i < N ; ++i){
    h_out[i] = relu_cpu(h_in[i]);
}
```
CUDA中 定义一个kernel通过`__global__` launch kernel通过 <<<,>>>  
```CUDA
__global__ void relu_gpu(float* in , float* out){
    int i = threadIdx.x；
    out[i] = in[i] > 0 ? in[i] : 0;
}
relu_gpu<<<1,N>>>(d_in,d_out);
```
## kernel launch
在<<<1,N>>>中 1指的是一个block  N指的是thread的数量 一个block含有有限个thread(256/512/1024)  
而多个block组合起来就是grid  
一个block在NVIDIA显卡中的一个小逻辑单元上运行 而其内容是有限的  

CUDA中有一个特殊的数据结构`dim3(x,y,z)`，而如果传入一个w 会自动生成这么一个数据类型  
以下是一些常用操作  
```CUDA
const int kCudaThreadsNum = 512
inline int CudaGetBlocks( const int N ){
return (N + kCudaThreadsNum - 1 ) / kCudaThreadsNum
}
#define CUDA_KERNEL_LOOP( i , n )       \
for (int i = blockIdx.x * blockDim x + threadIdx x ;     \
i < (n);       \
i += blockDim.x*gridDim.x)
```
```CUDA
__global__ void relu_gpu (float * in, float * out, int n) {
    CUDA_KERNEL_LOOP(i , n){
        out[ i ] = in[ i ] > 0 ? in[ i ] : 0;
    }
}
relu_gpu<<< CudaGetBlocks( N ), kCudaThreadsNum >>>(d_in , d_out , N)；
```
# GPU Memory and HardWare
内存的管理是容易出错的  
那么我们可以创造出一个class Tensor来管理它  
在其中我们可以完成内存的初始化 数据在CPU到GPU上的迁移  

对于一个tensor来说 无论有多少维 在物理内存上是连续的  
因此tensor应该存储的描述有  
- size：保存tensor的C,H,W
- strides：保存在每一个维度上前进的步长  H*W , W , 1
- dtype：数据类型
- device：对于位于的GPU上进行编号

## tensor operations
对于一个size为(2,3)的tensor  它的stride为(3,1)
- tensor[1,0] ：访问数据为3 * 1 + 1 * 0 位置的数据  
- tensor[1,:]：获取第一行 创建一个新描述的tensor  size(3,) stride(1,) offset 2 offset指的是生成的新tensor与原始tensor的内存位置的偏移
- tensor[:,1]：同上 size(2,) stride(1,) offset 3  
- tensor.reshape(3,2)

## GPU Memory Model
CPU具有自己的Host Memory  
每个线程内具有local memory  而一个block内则是shared memory  
而grid内则是Global memory  CPU的Host memory只能与Global Memory通信  
访问的速度方面 local > shared >> global >> cpu  
由于访问global memory是很慢的 而内存一般具有一致性 所以访问global memory时一般会获取附近一片的memory  如果后续有命中则加快了速度  

coalesced  内存访问的连续性与一致性 因可能让数据的访问是coalesced  
