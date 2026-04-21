---
title: "算法设计与分析"
permalink: /notes/算法设计与分析/
author_profile: true
---

这里收录的是我根据课堂内容与复习材料整理的《算法设计与分析》笔记。当前先同步期中复习总结，按题型梳理常见套路、复杂度结论与答题模板。

{% assign course_notes = site.notes | where: "subject", "算法设计与分析" | sort: "number" %}
<ul>
{% for note in course_notes %}
  <li><a href="{{ note.url | relative_url }}">{{ note.title }}</a></li>
{% endfor %}
</ul>
