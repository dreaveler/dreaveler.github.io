---
title: 18 NLP 任务、自动评测与 Benchmark 体系
date: "2026-06-04"
number: 18
categories:
  - 课程笔记
  - 自然语言处理基础
tags:
  - 自然语言处理基础
permalink: /notes/自然语言处理基础/18 NLP 任务、自动评测与 Benchmark 体系/
category_bar: true
---

> 这篇笔记整理 NLP 评测体系：怎样把自然语言问题定义成任务，怎样为不同输出形式选择自动指标，以及 GLUE、MMLU、HELM、HumanEval、Chatbot Arena 等 benchmark 分别在测什么。

## 从任务到指标再到 Benchmark

评价一个 NLP 系统，不能只问“模型好不好”。更精确的问题是：

```text
输入是什么，输出是什么，什么叫输出正确，在哪个数据分布上比较。
```

这可以拆成三层：

1. 任务定义：把真实问题写成从输入 `X` 到输出 `Y` 的映射。
2. 自动指标或人工协议：规定怎样比较模型输出和参考答案。
3. Benchmark：把任务、数据集、划分方式、指标和排行榜组织成可复现实验。

早期 NLP 常是单任务评测，例如情感分类、机器翻译或抽取式问答。大模型时代则更强调多任务、开放生成、真实用户分布和能力专项评测。

## 任务族：输出形式决定评测方式

NLP 任务虽然很多，但可以按输出形式归类。

| 任务族 | 输出形式 | 常见指标 |
| --- | --- | --- |
| 文本分类 | 固定标签 | accuracy、macro-F1 |
| 序列标注 | 每个 token 一个标签或实体 span | token accuracy、span-F1 |
| 句法分析 | 树或依存图 | UAS、LAS |
| 抽取式问答 | 原文中的连续 span | EM、token-F1 |
| 选择题问答 | 选项 ID | multiple-choice accuracy |
| 机器翻译 | 目标语言句子 | BLEU、chrF、COMET |
| 摘要 | 短文本 | ROUGE、BERTScore、人评 |
| 对话和开放生成 | 自由文本 | 人评、LLM-as-judge、Elo |
| 代码生成 | 可执行代码 | pass@k |
| 数学推理 | 数值、表达式或证明步骤 | EM、验证器结果 |

同一个任务可以有多个合理指标。SQuAD 同时报告 EM 和 token-level F1，因为完全字符串匹配太严格，而 F1 能容忍“Obama”和“Barack Obama”这种部分重叠。

## 分类指标：Accuracy、Precision、Recall、F1

二分类可以用混淆矩阵描述：

| | 预测正 | 预测负 |
| --- | --- | --- |
| 真值正 | TP | FN |
| 真值负 | FP | TN |

常用指标是：

```text
Accuracy  = (TP + TN) / (TP + FP + FN + TN)
Precision = TP / (TP + FP)
Recall    = TP / (TP + FN)
F1        = 2 * Precision * Recall / (Precision + Recall)
```

类别不均衡时，accuracy 可能误导。例如 99% 样本都是负类时，全部预测负也有 99% accuracy，但对正类没有任何识别能力。Precision 关注“预测为正的有多少真是正”，Recall 关注“真实为正的有多少被找出来”，F1 用调和平均折中两者。

多分类常见三种聚合：

- Macro-F1：每个类别等权，重视小类。
- Micro-F1：先累加全局 TP/FP/FN，接近整体准确率。
- Weighted-F1：按类别样本量加权。

## 序列标注与解析指标

命名实体识别、分块等序列标注任务通常不用单纯 token accuracy，因为实体边界和类型都重要。span-F1 把一个实体看作 `(start, end, label)`。只有起止位置和标签都匹配，才算 true positive。

依存分析则把句子表示成词之间的 head 关系：

- UAS 只要求 head 找对。
- LAS 同时要求 head 和依存标签都找对。

LAS 更严格，也更接近“结构分析是否真的正确”。

## 翻译指标：BLEU、chrF、COMET

BLEU 是机器翻译中的经典自动指标。它看候选译文和参考译文之间的 n-gram 重合，并用 brevity penalty 惩罚过短输出。

BLEU 的核心是 clipped precision。若候选反复输出 `the the the`，不能因为参考里有一个 `the` 就把所有重复都算作命中；每个 n-gram 的命中次数会被参考中的出现次数截断。

最终形式可以写成：

```text
BLEU = BP * exp(sum_n w_n * log p_n)
```

其中 `p_n` 是修正后的 n-gram precision，`BP` 是长度惩罚。BLEU 的优点是可复现、便宜；缺点是偏字面重合，难处理同义改写和多种合理译法。

chrF 改用字符 n-gram F-score，适合形态变化丰富或分词边界不稳定的语言。COMET 则是学习型指标，使用神经模型评估源句、候选译文和参考译文之间的关系，通常与人评相关性更高，但复现和可解释性弱于纯字符串指标。

## 摘要与生成指标：ROUGE、BERTScore、人评

摘要任务常用 ROUGE：

- ROUGE-1 看 unigram recall。
- ROUGE-2 看 bigram recall。
- ROUGE-L 看最长公共子序列。

ROUGE 偏 recall，适合衡量候选摘要是否覆盖参考摘要中的关键信息，但它仍然是表面匹配。BERTScore 用上下文嵌入的余弦相似度比较候选与参考，能容忍更多语义改写。

开放生成和对话更难。一个回答可以有无数合理写法，单一参考答案不够。常见做法是人工成对偏好比较，或用强模型做 LLM-as-judge。成对胜负可以用 Bradley-Terry 或 Elo 聚合成连续分数，Chatbot Arena 就属于这种真实用户分布下的偏好评测。

## 代码与数学：pass@k 和可验证答案

代码生成的核心不是字面相似，而是能否通过测试。HumanEval 和 MBPP 常报告 pass@k：模型采样 `k` 个候选，只要有一个通过测试就算成功。

实践中常先采样 `n` 个候选，其中 `c` 个通过测试，再估计 pass@k：

```text
pass@k = 1 - C(n - c, k) / C(n, k)
```

这个组合数公式比直接抽样估计更稳定。数学推理任务则常把答案归一化后做 exact match，或者使用程序验证器检查数值、表达式和证明步骤。

## Benchmark 谱系

不同 benchmark 覆盖的能力不同。

| Benchmark | 主要内容 | 适合回答的问题 |
| --- | --- | --- |
| SQuAD / Natural Questions | 阅读理解、抽取式 QA | 能否从文本中找答案 |
| GLUE / SuperGLUE | 多任务语言理解 | 通用 NLU 表征是否强 |
| MMLU | 多学科选择题 | 知识覆盖和考试式推理 |
| BBH | 较难推理子任务 | 模型是否能处理复杂推理模板 |
| HELM | 多场景、多指标评测 | 准确性之外的鲁棒性、校准、公平性 |
| HumanEval / MBPP | 代码生成 | 是否能写出通过测试的程序 |
| GSM8K / MATH | 数学文字题与竞赛题 | 数学推理和中间步骤能力 |
| MT-Bench / AlpacaEval | 指令回答偏好 | 助手回答质量 |
| Chatbot Arena | 真实用户成对偏好 | 面向用户的综合对话体验 |
| TruthfulQA / IFEval | 真实性、指令遵循 | 是否少幻觉、是否按要求回答 |

看排行榜时要先确认它测的是哪一类能力。MMLU 高不等于对话体验好，Chatbot Arena 高也不等于某个专业任务可靠。

## 评测中的常见陷阱

数据污染是 LLM 评测的核心问题。如果测试题在预训练或后训练数据中出现过，分数就不再代表泛化能力。污染不一定是完整泄漏，也可能是题目变体、答案解析或相似样本泄漏。

Prompt 敏感也很常见。同一个模型在 zero-shot、few-shot、chain-of-thought、不同选项顺序下可能得到不同分数。因此 benchmark 应该固定协议，或报告多 prompt 平均。

选择题评测还要考虑选项偏置。模型可能偏好某些字母、某些长度或某些表述方式。开放生成评测则有长度偏置，较长回答容易看起来更详细，LLM-as-judge 也可能偏好啰嗦回答。

最后是 leaderboard overfitting。研究社区长期围绕某个榜单调参时，榜单会逐渐变成训练目标，而不是独立测试。一个可信 benchmark 应该有隐藏测试集、多样任务和定期更新。

## 读评测结果时的检查清单

评价一组模型分数时，至少检查：

1. 任务输出是什么，指标是否适合这个输出形式。
2. 测试集是否可能被污染，是否有去重或时间切分。
3. Prompt、采样温度、解码方式和样本数是否固定。
4. 分数差异是否有统计显著性，尤其是小测试集。
5. 指标是否只衡量表面匹配，而忽略事实性、安全性或用户偏好。

NLP 评测的目标不是找到一个万能分数，而是把“模型在哪些条件下表现好”说清楚。
