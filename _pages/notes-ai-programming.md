---
title: "AI中的编程"
permalink: /notes/AI中的编程/
author_profile: true
---

以下是《AI中的编程》的站内笔记索引。内容目前以课程信息、基础概念和我自己觉得容易忘的实现细节为主。

{% assign course_notes = site.notes | where: "subject", "AI中的编程" | sort: "number" %}
<ul>
{% for note in course_notes %}
  <li><a href="{{ note.url | relative_url }}">{{ note.title }}</a></li>
{% endfor %}
</ul>
