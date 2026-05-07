---
title: "角色动画与运动仿真"
permalink: /notes/角色动画与运动仿真/
author_profile: true
---

这里收录的是我根据课程资料、课件与整理笔记同步生成的《角色动画与运动仿真》课程入口页。当前先公开一篇站内导览笔记，并附上完整 PDF 版课程笔记，内容覆盖课程导论、数学基础、角色运动学、关键帧动画、数据驱动方法、学习方法、蒙皮与表情动画，以及基于物理的仿真这条主线。

我优先保留了适合公开阅读与复习使用的版本：一方面可以直接从 PDF 通读整门课的知识地图，另一方面也保留站内条目，方便后续继续拆成更细的章节笔记。

- [完整课程笔记 PDF](/files/角色动画与运动仿真课程笔记.pdf)

{% assign course_notes = site.notes | where: "subject", "角色动画与运动仿真" | sort: "number" %}
<ul>
{% for note in course_notes %}
  <li><a href="{{ note.url | relative_url }}">{{ note.title }}</a></li>
{% endfor %}
</ul>
