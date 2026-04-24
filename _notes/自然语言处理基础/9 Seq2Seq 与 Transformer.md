---
number: 9
title: "9 Seq2Seq 与 Transformer"
subject: 自然语言处理基础
date: 2026-04-24
---

> 北京大学《自然语言处理基础》第 9 讲整理。内容基于课程补充材料与整理稿，主线是从 Encoder-Decoder、Attention 一路走到 Transformer，并建立它们和条件语言模型的统一理解。

## 核心问题

前面的分类、序列标注和句法分析，很多时候输出长度和输入长度关系比较固定；但有一类任务不是这样。

例如：

- 机器翻译
- 文本摘要
- 对话生成
- 语音识别

这些任务的共同点是：

- 输入和输出都是序列
- 长度不一定相同
- 输出要一个 token 一个 token 地生成

这就是 Seq2Seq 问题。

## Seq2Seq 的统一表达

Seq2Seq 可以从条件语言模型视角统一写成：

```text
P(y1, ..., yT | x) = Π P(yt | y<t, x)
```

这个式子的意义非常重要：

- 给定输入序列 `x`
- 输出序列不是一次性吐出来
- 而是每一步在“前面已经生成的内容”和“输入条件”基础上继续生成

所以从本质上说，Seq2Seq 是“带条件的自回归生成”。

## 最早的 Encoder-Decoder

早期 Seq2Seq 模型通常使用 RNN 或 LSTM。

它的思路可以概括成两步：

### 1. Encoder

把输入序列逐个读入，压缩成一个向量表示。

### 2. Decoder

从这个表示出发，再逐步生成输出序列。

这个框架很自然，但它有一个明显瓶颈：

如果整句输入都被压缩进一个固定长度向量，那么长句信息很容易丢失。

## Attention 为什么会出现

Attention 的出现，本质上是为了解决这个“单一瓶颈向量”问题。

它的核心思想是：

Decoder 在每一步生成输出时，不必只依赖一个固定句向量，而是可以动态回头看输入序列中更相关的部分。

这意味着模型不再是“先全部压缩、再全部解码”，而是变成：

- 编码器保留每个位置的信息
- 解码器每一步有选择地关注其中一部分

## Attention 在做什么

最值得记住的直觉不是公式，而是角色分工：

- Query：当前我在找什么
- Key：每个输入位置提供什么索引信息
- Value：每个输入位置真正承载什么内容

Attention 就是在比较 query 和各个 key 的匹配程度，再对 value 做加权求和。

因此它可以理解成一种“软检索”机制。

## 为什么 scaled dot-product 要除以 sqrt(dk)

这是 Transformer 里很常见的考点。

如果向量维度很高，点积的方差会随维度增大而变大，softmax 就更容易进入极端饱和区，梯度会变差。

所以除以 `sqrt(dk)` 的作用，是把数值尺度控制住，让训练更稳定。

复习时记住这一层统计直觉就够了。

## Self-Attention 的关键变化

普通 attention 里，query 和 key/value 可能来自不同位置或不同模块；而 self-attention 则是：

- query、key、value 都来自同一个序列

这意味着序列中的每个位置，都可以直接查看其它所有位置。

它带来的一个根本优势是：

任意两个位置之间的依赖路径长度变成了 1。

相比之下：

- RNN 需要一步步传递
- CNN 也需要多层卷积扩大感受野

因此 self-attention 在建模长距离依赖时更直接。

## Multi-Head 在解决什么

如果只有一个 attention 头，模型每次只能学一种关注方式。

Multi-Head 的意义是：

- 把表示空间拆成多个子空间
- 每个头学不同的关系模式
- 最后再把它们拼接起来

这样模型就能同时关注：

- 词法关系
- 句法关系
- 长距离语义关系
- 局部搭配信息

因此 multi-head 不是简单地“多做几次 attention”，而是提高表示能力。

## Transformer 的结构

Transformer 最核心的变化，是把 RNN 完全拿掉，改成：

- Self-Attention
- 前馈网络 FFN
- 残差连接
- LayerNorm

在 encoder 里，主要是：

- Multi-Head Self-Attention
- FFN

在 decoder 里，还要额外加入：

- masked self-attention
- encoder-decoder attention

其中 mask 的作用很关键：

生成第 `t` 个词时，不能偷看未来位置。

## 为什么还需要位置编码

Self-attention 本身不包含序列顺序信息。

如果不给它额外的位置信号，模型只知道“有哪些 token”，却不知道“谁在前谁在后”。

因此 Transformer 需要 positional encoding。

无论是正弦位置编码，还是可学习位置编码，本质上都在补：

顺序信息。

## Teacher Forcing 与 Exposure Bias

这一讲另一个高频考点是训练和推理的不一致。

训练时，decoder 常常拿到真实前缀，也就是 ground-truth 的前面 token，这叫 teacher forcing。

但测试时，它只能看到自己前一步生成的结果。

这就会造成：

- 训练分布和推理分布不一致
- 一旦前面生成错了，后面会被连锁带偏

这就是 exposure bias。

## Beam Search 为什么重要

如果每一步都只贪心选当前最大概率 token，可能会过早丢掉整体更优的序列。

Beam search 的思路是：

- 保留前 `K` 个部分候选
- 每一轮扩展后再截断

它在速度和全局搜索之间做折中。

复习时记住：

- greedy 是 `K = 1` 的 beam search
- beam 越宽，越接近全局最优，但代价也越大

## Transformer 为什么是里程碑

这一讲真正要建立的判断是：

Transformer 的成功不只是“效果更好”，而是它在建模和工程上同时占优。

### 建模上

- 更容易捕捉长距离依赖
- 表达能力更强
- 能自然堆叠多层

### 工程上

- 更容易并行训练
- 不像 RNN 那样强依赖时间步串行
- 更适合大规模数据和大模型扩展

这也是为什么后来会出现：

- BERT
- GPT
- T5
- BART

它们本质上都建立在 Transformer 骨架上。

## 这一讲和前面内容怎么连起来

一个很好的复习方法，是把它和前面几讲接起来：

- 语言模型讲的是“如何给词序列赋概率”
- Seq2Seq 讲的是“如何在输入条件下给输出序列赋概率”
- Attention / Transformer 则是在回答“这个概率模型该怎样更高效、更强大地实现”

因此 Transformer 不是凭空出现的新东西，而是前面概率建模思路的进一步神经化和工程化。

## 复习抓手

考前如果只记最核心的点，优先抓这些：

- Seq2Seq 本质是条件自回归生成
- RNN Encoder-Decoder 的瓶颈是固定长度上下文向量
- Attention 让 decoder 能动态访问输入不同位置
- Self-Attention 让任意位置可直接交互
- scaled dot-product 除以 `sqrt(dk)` 是为控制方差、稳定训练
- Multi-Head 提升模型对不同关系模式的建模能力
- Transformer 用 attention 取代 RNN，并依靠位置编码补顺序信息
- Teacher forcing 会带来 exposure bias
- beam search 是 greedy 的推广

## 一句话总结

这一讲最重要的主线是：

Seq2Seq 解决“如何生成变长输出”，Attention 解决“生成时该看输入哪里”，Transformer 则把这套机制发展成了现代 NLP 的主干架构。
