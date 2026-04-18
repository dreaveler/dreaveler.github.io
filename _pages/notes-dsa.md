---
title: "数据结构与算法A"
permalink: /notes/数据结构与算法A/
author_profile: true
---

以下是《数据结构与算法A》的站内笔记索引。当前已同步的是课程前几讲的整理稿，后续如果继续补全，会直接更新在这里。

{% assign course_notes = site.notes | where: "subject", "数据结构与算法A" | sort: "number" %}
<ul>
{% for note in course_notes %}
  <li><a href="{{ note.url | relative_url }}">{{ note.title }}</a></li>
{% endfor %}
</ul>
