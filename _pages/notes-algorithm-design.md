---
title: "算法设计与分析"
permalink: /notes/算法设计与分析/
author_profile: true
---

这里收录的是我根据课堂内容、复习材料与课堂笔记整理的《算法设计与分析》笔记。当前已同步期中复习总结和“分治策略”专题，前者偏考试抓手，后者偏概念框架与经典递推分析。

{% assign course_notes = site.notes | where: "subject", "算法设计与分析" | sort: "number" %}
<ul>
{% for note in course_notes %}
  <li><a href="{{ note.url | relative_url }}">{{ note.title }}</a></li>
{% endfor %}
</ul>
