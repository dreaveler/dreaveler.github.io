---
title: "软件设计实践"
permalink: /notes/软件设计实践/
author_profile: true
---

以下是我整理的《软件设计实践》课程笔记。内容以课程主线、个人理解和考前复习为主，不求面面俱到，但会尽量保留我认为最值得回看的部分。

{% assign course_notes = site.notes | where: "subject", "软件设计实践" | sort: "number" %}
<ul>
{% for note in course_notes %}
  <li><a href="{{ note.url | relative_url }}">{{ note.title }}</a></li>
{% endfor %}
</ul>
