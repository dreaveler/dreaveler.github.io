---
title: "算法设计与分析"
permalink: /notes/算法设计与分析/
author_profile: true
---

这里收录的是我根据课堂内容、课程资料、Notion 课堂笔记与复习材料整理的《算法设计与分析》笔记。当前既有一篇导论笔记，先把“算法、复杂度与可计算性”的课程地图搭起来，也同步了期中复习总结、“分治策略”“动态规划、贪心与回溯”，以及一份按题型整理的往年真题练习集，覆盖从复杂度视角到常见算法设计范式的主线。

{% assign course_notes = site.notes | where: "subject", "算法设计与分析" | sort: "number" %}
<ul>
{% for note in course_notes %}
  <li><a href="{{ note.url | relative_url }}">{{ note.title }}</a></li>
{% endfor %}
</ul>
