---
title: "中级微观经济学"
permalink: /notes/中级微观经济学/
author_profile: true
---

这里收录的是我根据课程资料与 PPT 整理的《中级微观经济学》复习内容。目前站内公开的是期末复习手册版本，适合作为考前快速回顾使用。

{% assign course_notes = site.notes | where: "subject", "中级微观经济学" | sort: "number" %}
<ul>
{% for note in course_notes %}
  <li><a href="{{ note.url | relative_url }}">{{ note.title }}</a></li>
{% endfor %}
</ul>
