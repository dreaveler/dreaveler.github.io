---
title: "算法设计与分析"
permalink: /notes/算法设计与分析/
author_profile: true
---

这里收录的是我根据课堂内容、课程资料、Notion 课堂笔记与复习材料整理的《算法设计与分析》笔记。当前既有一篇导论笔记，先把“算法、复杂度与可计算性”的课程地图搭起来，也同步了期中复习总结、“分治策略”“动态规划、贪心与回溯”、往年真题练习集，以及 NP 完全理论，覆盖从常见算法设计范式到复杂性理论的主线。

除了站内分主题条目，我也把完整课程笔记和一份适合考前快速通读的整理版 PDF 放在这里，方便按“课程主线”或“题型模板 + 典型结论”的方式回看：

- [算法设计与分析课程笔记 PDF](/files/算法设计与分析课程笔记.pdf)
- [算法设计与分析期中复习总结 PDF](/files/算法设计与分析期中复习总结.pdf)

{% assign course_notes = site.notes | where: "subject", "算法设计与分析" | sort: "number" %}
<ul>
{% for note in course_notes %}
  <li><a href="{{ note.url | relative_url }}">{{ note.title }}</a></li>
{% endfor %}
</ul>
