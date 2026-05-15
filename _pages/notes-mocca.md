---
title: "角色动画与运动仿真"
permalink: /notes/角色动画与运动仿真/
author_profile: true
---

这里收录的是我根据课程资料、课件与整理笔记同步生成的《角色动画与运动仿真》课程入口页。当前公开课程导览、角色驱动控制与 Learning to Walk 两篇站内讲义，并附上完整 PDF 版课程笔记，内容覆盖课程导论、数学基础、角色运动学、关键帧动画、数据驱动方法、学习方法、蒙皮与表情动画、基于物理的仿真、角色驱动控制，以及动态平衡与步态控制这条主线。

我优先保留了适合公开阅读与复习使用的版本：一方面可以直接从 PDF 通读整门课的知识地图，另一方面也保留站内条目，方便按“课程地图 -> 物理控制 -> 行走控制”的顺序快速定位重点。

- [完整课程笔记 PDF](/files/角色动画与运动仿真课程笔记.pdf)

{% assign course_notes = site.notes | where: "subject", "角色动画与运动仿真" | sort: "number" %}
<ul>
{% for note in course_notes %}
  <li><a href="{{ note.url | relative_url }}">{{ note.title }}</a></li>
{% endfor %}
</ul>
