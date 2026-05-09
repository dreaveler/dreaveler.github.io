---
title: "可信机器学习"
permalink: /notes/可信机器学习/
author_profile: true
---

这里收录的是我根据课程资料、课件与整理笔记同步生成的《可信机器学习》课程入口页。当前先公开课程导航笔记、对抗鲁棒性实验记录，并附上完整 PDF 版课程笔记，内容覆盖课程导论、机器学习基础、CNN、可解释性方法，以及对抗攻击与对抗防御这条主线。

我优先保留了适合公开阅读与复习使用的版本：一方面可以直接从 PDF 快速通读全局框架，另一方面也保留站内条目，方便后续继续拆成更细的章节笔记或实验笔记。

- [完整课程笔记 PDF](/files/可信机器学习课程笔记.pdf)

{% assign course_notes = site.notes | where: "subject", "可信机器学习" | sort: "number" %}
<ul>
{% for note in course_notes %}
  <li><a href="{{ note.url | relative_url }}">{{ note.title }}</a></li>
{% endfor %}
</ul>
