---
title: 15 提示学习与 RAG
date: "2026-05-22"
number: 15
categories:
  - 课程笔记
  - 自然语言处理基础
tags:
  - 自然语言处理基础
permalink: /notes/自然语言处理基础/15 提示学习与 RAG/
category_bar: true
---

> 这篇笔记整理自然语言处理基础中 prompting 之后的语言模型使用范式。核心问题是：当模型已经通过大规模预训练获得通用语言能力后，怎样在不更新参数的情况下，把一个具体任务交给它完成。

## Prompting 的基本思想

Prompting 把下游任务改写成模型熟悉的文本补全问题。给定输入 `x`，提示函数 `prompt(x)` 生成一段带任务说明、上下文和答案槽的文本，模型在冻结参数的情况下预测答案：

```text
y_hat = argmax_y P(y | prompt(x))
```

情感分类可以写成：

```text
Review: I love this movie.
Overall, the movie was [MASK].
```

模型补出 `fantastic` 后，再通过 verbalizer 把它映射成 `Positive`。这里的关键不是新增分类头，而是把标签空间翻译成模型预训练时见过的自然语言表达。

## 标准工作流

一个 prompt-based 系统通常包含四步：

1. 分析任务，明确输入、输出和约束。
2. 设计模板，把输入填入自然语言上下文。
3. 让模型生成候选答案。
4. 对生成结果做抽取、格式化和标签映射。

因此 prompt 的质量会直接影响模型表现。模板中的措辞、答案词的选择、示例顺序和输出格式都可能改变结果。复习时不要把 prompting 理解成“随便写一句话”，它本质上是在设计模型可读的任务接口。

## Few-shot 与 In-Context Learning

Few-shot prompting 会在当前输入前放入若干示例：

```text
Review: A heartwarming masterpiece. Sentiment: Positive
Review: Dull and far too long. Sentiment: Negative
Review: The acting saved a weak plot. Sentiment: Positive
Review: I love this movie. Sentiment:
```

模型从上下文中识别任务格式、标签空间和输出风格，然后直接补全最后一行。这种不更新权重、只在上下文中适配任务的能力称为 in-context learning。

形式上，若上下文中有 `k` 个示例 `(x_i, y_i)`，模型预测：

```text
y_hat = argmax_y P(y | (x_1, y_1), ..., (x_k, y_k), x_test)
```

注意这里没有梯度更新。所谓“learning”发生在一次前向推理的上下文里，而不是参数里。

## 示例为什么有效

示例不一定只是在教模型输入到标签的真实映射。Min et al. 2022 的实验显示，把 demonstrations 的标签随机打乱后，性能有时下降并不大。这说明示例常常主要帮助模型识别：

- 这是一个什么任务。
- 输出候选标签有哪些。
- 输入和输出之间使用什么格式连接。
- 当前回答应该遵守什么风格。

因此选择示例时要关注相关性、多样性、标签覆盖和顺序。常见策略是用向量相似度选与测试样本相近的示例，或者让示例集合覆盖不同类型的输入。

## Chain of Thought

Chain-of-Thought prompting 要求模型先写出中间推理，再给出答案。它对算术、符号推理、常识推理等多步任务特别有效，因为它把一次性答案拆成多个可见步骤，相当于给模型更多 token 作为计算预算。

Zero-shot CoT 则更简单，只在问题后加一句：

```text
Let's think step by step.
```

这句提示不提供示例，却能诱导模型展开推理。后续的 Program-aided Language Models、Program of Thoughts 和 Tree of Thoughts 都延续同一思路：把复杂任务拆成更可检查的中间过程。区别在于，PAL 和 PoT 会让模型生成代码并交给解释器计算，ToT 则同时探索多条推理路径并支持回溯。

## Prompt Engineering

Prompt engineering 研究如何系统地设计提示。手工方法依赖清晰指令、必要背景、输出格式和少量示例；自动方法则把提示本身当成可搜索或可训练的对象。

常见路线包括：

- Prompt paraphrasing：改写已有提示，挑选效果最好的版本。
- AutoPrompt：在离散 token 空间中搜索触发词。
- Prompt tuning：只训练拼在输入前的软提示向量。
- Prefix tuning：在模型各层注入可训练前缀向量。

离散提示可读、便于人检查；连续提示不可读，但参数高效，适合固定模型上做轻量适配。

## RAG 的动机

Retrieval-Augmented Generation 把外部检索接到生成模型前面。它解决的是纯语言模型的三个弱点：

- 参数中的知识可能过时。
- 模型可能在缺少依据时产生幻觉。
- 领域细节和私有知识不一定在预训练语料中。

RAG 的基本流程是：先用查询检索相关文档，再把文档片段拼入 prompt，最后让生成模型基于检索内容回答。

## RAG 的形式化

如果把检索文档 `z` 看作隐变量，RAG 可以写成：

```text
P(y | x) = sum_z P(z | x) P(y | x, z)
```

其中 `P(z | x)` 是 retriever 对文档的打分，`P(y | x, z)` 是 generator 在给定文档后的生成概率。实际系统不会枚举所有文档，而是取 top-k 检索结果近似。

改进 RAG 通常有两条线：

- 改进检索：更好的索引、查询扩展、查询重写、重排序。
- 改进结合：压缩检索结果、过滤噪声、迭代检索，或者让模型判断何时需要检索。

## 复习抓手

这一章可以按“接口、上下文、外部知识”三层记忆：

- Prompting：把任务写成冻结模型能补全的文本接口。
- In-context learning：用上下文示例让模型识别任务和输出格式。
- CoT / PAL / ToT：把复杂推理展开为更长、更结构化的中间过程。
- RAG：把外部知识检索进上下文，降低过时知识和幻觉风险。

如果题目要求比较 prompting 与 fine-tuning，先说明是否更新参数，再说明任务信息放在哪里：fine-tuning 把任务写进权重，prompting 把任务写进上下文。
