---
title: "自然语言处理基础"
permalink: /notes/自然语言处理基础/
author_profile: true
---

这里收录的是我根据课程讲授与课件整理的《自然语言处理基础》站内笔记。当前已同步课程导论、词义消歧，以及从分类模型过渡到语言模型的整理稿，重点放在课程框架、核心任务和复习时最容易混淆的概念上。

{% assign course_notes = site.notes | where: "subject", "自然语言处理基础" | sort: "number" %}
<ul>
{% for note in course_notes %}
  <li><a href="{{ note.url | relative_url }}">{{ note.title }}</a></li>
{% endfor %}
</ul>
