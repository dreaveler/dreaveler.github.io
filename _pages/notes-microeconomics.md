---
title: "中级微观经济学"
permalink: /notes/中级微观经济学/
author_profile: true
---

这里收录的是我根据课程资料与 PPT 整理的《中级微观经济学》笔记。当前站内一篇是覆盖全课程主线的详细版期末复习手册，另一篇把“偏好-选择-需求-斯勒茨基”单独抽出来，适合按专题回看消费者理论前半段。

{% assign course_notes = site.notes | where: "subject", "中级微观经济学" | sort: "number" %}
<ul>
{% for note in course_notes %}
  <li><a href="{{ note.url | relative_url }}">{{ note.title }}</a></li>
{% endfor %}
</ul>
