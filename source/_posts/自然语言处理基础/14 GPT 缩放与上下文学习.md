---
title: 14 GPT 缩放与上下文学习
date: "2026-05-23"
number: 14
categories:
  - 课程笔记
  - 自然语言处理基础
tags:
  - 自然语言处理基础
permalink: /notes/自然语言处理基础/14 GPT 缩放与上下文学习/
category_bar: true
---

> 这篇笔记整理自然语言处理基础中 GPT-2 / GPT-3 之后的范式转变。核心问题是：为什么继续放大 decoder-only 语言模型，会让模型从“预训练后再微调”逐渐走向“用提示和上下文直接完成任务”。

## 从微调默认到规模化预训练

在 BERT、T5、GPT-1 之后，下游任务的常规做法仍然是 fine-tuning：先拿一个预训练模型，再为情感分类、问答、自然语言推理等任务分别更新参数。这个范式很有效，但有三个代价：

- 每个任务都需要足够的标注数据。
- 每个任务都要重新计算梯度并保存一份适配后的权重。
- 模型越大，微调的算力和工程成本越高。

GPT-2 和 GPT-3 探索的是另一条路：不为每个任务专门训练，而是把语言模型本身放大到能从自然语言上下文中识别任务。放大的对象不是单一维度，而是参数量、训练数据和算力三条轴一起增长。

## GPT-1 / GPT-2 / GPT-3 的量级

GPT 系列保持同一个基本目标：用 decoder-only Transformer 根据前文预测下一个 token。

```text
P(x_1, ..., x_n) = product_t P(x_t | x_<t)
```

重要变化主要来自规模：

| 模型 | 参数量 | 训练数据 | 关键现象 |
| --- | --- | --- | --- |
| GPT-1 | 117M | 约 1B words | 预训练后再微调 |
| GPT-2 | 1.5B | 约 14B words | 初步 zero-shot 多任务能力 |
| GPT-3 | 175B | 约 300B tokens | few-shot / in-context learning 显著增强 |

GPT-2 的论文标题是 *Language Models are Unsupervised Multitask Learners*。它的主张是：互联网文本中天然包含大量任务演示，例如翻译、摘要、问答、解释和列表补全。语言模型只做下一个 token 预测，也可能顺带学会这些任务格式。

## Zero-shot 与任务框架

GPT-2 的 zero-shot 能力来自 task framing：把任务写成模型可续写的自然语言前缀，而不是增加任务专属分类头。

```text
Translate to French: cheese =>
```

如果模型续写 `fromage`，它就在没有更新权重的情况下完成了一次翻译。类似地，摘要可以写成 `TL;DR:`，问答可以写成 `Q: ... A:`，情感分类可以写成 `Review: ... Sentiment:`。

这说明任务信息可以放进上下文，而不一定要写进模型参数。不过 GPT-2 阶段的效果还有限，多数标准基准上 fine-tuning 仍然更可靠。

## GPT-3 与 In-Context Learning

GPT-3 把这个想法进一步放大。它最重要的使用方式是 in-context learning：把若干输入输出示例直接放进 prompt，模型在一次前向推理中识别规则并回答新样本。

给定示例 `(x_1, y_1), ..., (x_k, y_k)` 和查询 `x_test`，模型预测：

```text
y_hat = argmax_y P(y | (x_1, y_1), ..., (x_k, y_k), x_test)
```

这里没有反向传播，也没有参数更新。所谓“学习”只发生在当前上下文激活里。按示例数量可以分成：

| 设定 | 示例数 | Prompt 形态 |
| --- | --- | --- |
| Zero-shot | 0 | 任务说明 + 查询 |
| One-shot | 1 | 任务说明 + 一个示例 + 查询 |
| Few-shot | 多个 | 任务说明 + 多个示例 + 查询 |

一个 few-shot 翻译提示可以写成：

```text
Translate English to French:
sea otter => loutre de mer
peppermint => menthe poivree
cheese =>
```

模型从前两个示例中推断出 `=>` 左侧应译成法语，然后补全最后一行。关键点是：示例只是上下文，不是训练集。

## Scaling Laws

Scaling laws 描述的是：当参数量、数据量或算力增加时，语言模型的测试损失通常按幂律下降。在 log-log 坐标中，这种关系近似为直线：

```text
L(N) ~= (N_c / N)^alpha
```

其中 `N` 是参数量，`L(N)` 是损失，`alpha` 是正的经验指数。它的实践意义有三点：

- 可以用较小规模实验外推更大模型的预期损失。
- 参数、数据和算力需要协调增长，任一维度不足都会成为瓶颈。
- 在观察到的平台期之前，继续放大仍可能稳定带来收益。

缩放律解释的是预训练损失的平滑下降，但下游能力不一定平滑。

## 涌现能力

涌现能力指某些任务能力在模型规模超过阈值后突然显著出现。小模型可能几乎随机，大模型却能在同一任务上明显超过随机，例如多步算术、复杂推理、指令遵循或少样本泛化。

这和缩放律并不矛盾。预训练 loss 可以连续下降，但下游指标常常是离散或阈值式的：一点点语言建模能力改进，可能在某个任务上表现为从“不会”到“会”的跳变。

## 为什么是 Decoder-only

GPT 缩放路线选择 decoder-only，有几个直接原因：

- 训练目标和生成方式一致，都是从左到右预测下一个 token。
- 每个位置都有预测信号，比只预测 `[MASK]` 的目标更适合大规模密集训练。
- 自回归生成天然适配 prompt、续写、对话和开放式任务。
- 推理时可以使用 KV cache 复用历史上下文，长文本生成效率更好。

Encoder-only 模型如 BERT 更适合理解和抽取；encoder-decoder 模型如 T5/BART 更适合输入到输出的转换。Prompting 时代需要模型直接生成答案，decoder-only 因此成为大模型路线的主流底座。

## 复习抓手

这一章可以按“规模带来范式变化”来记：

- GPT-2：语言模型开始显示 zero-shot 多任务潜力，但效果仍有限。
- GPT-3：few-shot 和 in-context learning 让任务适配从“更新权重”转向“组织上下文”。
- Scaling laws：预训练损失随参数、数据和算力按幂律下降。
- Emergent abilities：部分下游能力会在足够规模后突然出现。
- Decoder-only：训练、生成和 prompting 使用方式最一致。

如果题目要求比较 fine-tuning 和 in-context learning，先看是否更新参数：fine-tuning 把任务信息写进权重，in-context learning 把任务信息写进 prompt。
