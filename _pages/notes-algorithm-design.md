---
title: "算法设计与分析"
permalink: /notes/算法设计与分析/
author_profile: true
---

这里收录的是我根据课堂内容、复习材料与课堂笔记整理的《算法设计与分析》笔记。当前已同步期中复习总结、“分治策略”“动态规划、贪心与回溯”，以及一份按题型整理的往年真题练习集，覆盖从递推分析到常见算法设计范式的主线，也补了一层更偏刷题的复习材料。

{% assign course_notes = site.notes | where: "subject", "算法设计与分析" | sort: "number" %}
<ul>
{% for note in course_notes %}
  <li><a href="{{ note.url | relative_url }}">{{ note.title }}</a></li>
{% endfor %}
</ul>
