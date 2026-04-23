---
title: "自然语言处理基础"
permalink: /notes/自然语言处理基础/
author_profile: true
---

这里收录的是我根据课程讲授、课件与整理稿同步的《自然语言处理基础》站内笔记。当前已覆盖课程导论、词义消歧、分类模型与语言模型，并新增分布式语义、HMM 与序列标注两讲，优先保留适合复习时快速定位主线的版本。

{% assign course_notes = site.notes | where: "subject", "自然语言处理基础" | sort: "number" %}
<ul>
{% for note in course_notes %}
  <li><a href="{{ note.url | relative_url }}">{{ note.title }}</a></li>
{% endfor %}
</ul>
