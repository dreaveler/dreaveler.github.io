---
title: "自然语言处理基础"
permalink: /notes/自然语言处理基础/
author_profile: true
---

这里收录的是我根据课程讲授、课件、补充材料与整理稿同步的《自然语言处理基础》站内笔记。当前已覆盖课程导论、词义消歧、分类模型与语言模型、分布式语义、HMM 与序列标注，并继续补到短语结构句法分析、依存句法分析、Seq2Seq / Transformer、形式语义、信息检索与预训练语言模型，以及一次 HMM 词性标注实践总结，优先保留适合复习时快速定位主线的版本。

除了站内分章节笔记，我也把最近整理出的两份 PDF 版资料一并放到这里，分别适合完整通读与期中前的专题复习：

- [完整课程笔记 PDF](/files/FNLP课程笔记_v6_lec10_11.pdf)
- [期中专题复习笔记 PDF](/files/FNLP期中专题复习笔记.pdf)

{% assign course_notes = site.notes | where: "subject", "自然语言处理基础" | sort: "number" %}
<ul>
{% for note in course_notes %}
  <li><a href="{{ note.url | relative_url }}">{{ note.title }}</a></li>
{% endfor %}
</ul>
