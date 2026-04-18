---
title: "计算机视觉"
permalink: /notes/计算机视觉/
author_profile: true
---

以下是《计算机视觉》的站内笔记索引。当前同步的是已经整理成可读稿的部分，重点偏课程框架和个人复习时需要反复查看的知识点。

{% assign course_notes = site.notes | where: "subject", "计算机视觉" | sort: "number" %}
<ul>
{% for note in course_notes %}
  <li><a href="{{ note.url | relative_url }}">{{ note.title }}</a></li>
{% endfor %}
</ul>
