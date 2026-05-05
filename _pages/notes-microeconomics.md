---
title: "中级微观经济学"
permalink: /notes/中级微观经济学/
author_profile: true
---

这里收录的是我根据课程资料与 PPT 整理的《中级微观经济学》笔记。当前站内包括一篇覆盖全课程主线的详细版期末复习手册、一篇聚焦“偏好-选择-需求-斯勒茨基”的前半段专题，以及一篇补足“禀赋-跨期选择-消费者剩余”的后半段专题，便于按主线或按章节两种方式复习。

最新版总复习手册也提供 PDF 下载：[`中级微观经济学期末复习手册`](/files/中级微观经济学期末复习手册.pdf)

{% assign course_notes = site.notes | where: "subject", "中级微观经济学" | sort: "number" %}
<ul>
{% for note in course_notes %}
  <li><a href="{{ note.url | relative_url }}">{{ note.title }}</a></li>
{% endfor %}
</ul>
