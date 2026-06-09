---
title: 自然语言处理基础
layout: page
permalink: /notes/自然语言处理基础/
---

这里收录的是我根据课程讲授、课件、补充材料与整理稿同步的《自然语言处理基础》站内笔记。当前已覆盖课程导论、词义消歧、分类模型与语言模型、分布式语义、HMM 与序列标注，并继续补到短语结构句法分析、依存句法分析、Seq2Seq / Transformer、形式语义、信息检索、预训练语言模型、GPT 缩放与上下文学习、提示学习与 RAG、训练大语言模型的数据、后训练与 RLHF、NLP 任务/自动评测/Benchmark 体系，以及一次 HMM 词性标注实践总结，优先保留适合复习时快速定位主线的版本。PDF 版已更新到覆盖全课程主线的 v11 full 整理稿。

除了站内分章节笔记，我也把最近整理出的两份 PDF 版资料一并放到这里，分别适合完整通读与期中前的专题复习：


<div class="note-downloads">
  <strong>下载资料</strong>
  <ul>
    <li><a href="/files/FNLP课程笔记_v11_full.pdf">完整课程笔记 PDF</a></li>
    <li><a href="/files/FNLP期中专题复习笔记.pdf">期中专题复习笔记 PDF</a></li>
  </ul>
</div>


<h2>站内笔记</h2>

<div class="course-note-list">
  <a class="course-note-row" href="/notes/自然语言处理基础/1 课程介绍/">
    <span class="course-note-row__number">1</span>
    <span class="course-note-row__title">1 课程介绍</span>
    <span class="course-note-row__date">2026-03-04</span>
  </a>
  <a class="course-note-row" href="/notes/自然语言处理基础/2 词义消歧（WSD）/">
    <span class="course-note-row__number">2</span>
    <span class="course-note-row__title">2 词义消歧（WSD）</span>
    <span class="course-note-row__date">2026-03-05</span>
  </a>
  <a class="course-note-row" href="/notes/自然语言处理基础/3 自然语言处理导论/">
    <span class="course-note-row__number">3</span>
    <span class="course-note-row__title">3 自然语言处理导论</span>
    <span class="course-note-row__date">2026-04-22</span>
  </a>
  <a class="course-note-row" href="/notes/自然语言处理基础/4 分类模型与语言模型/">
    <span class="course-note-row__number">4</span>
    <span class="course-note-row__title">4 分类模型与语言模型</span>
    <span class="course-note-row__date">2026-04-22</span>
  </a>
  <a class="course-note-row" href="/notes/自然语言处理基础/5 分布式语义/">
    <span class="course-note-row__number">5</span>
    <span class="course-note-row__title">5 分布式语义</span>
    <span class="course-note-row__date">2026-04-23</span>
  </a>
  <a class="course-note-row" href="/notes/自然语言处理基础/6 HMM与序列标注/">
    <span class="course-note-row__number">6</span>
    <span class="course-note-row__title">6 HMM 与序列标注</span>
    <span class="course-note-row__date">2026-04-23</span>
  </a>
  <a class="course-note-row" href="/notes/自然语言处理基础/7 短语结构句法分析/">
    <span class="course-note-row__number">7</span>
    <span class="course-note-row__title">7 短语结构句法分析</span>
    <span class="course-note-row__date">2026-04-24</span>
  </a>
  <a class="course-note-row" href="/notes/自然语言处理基础/8 依存句法分析/">
    <span class="course-note-row__number">8</span>
    <span class="course-note-row__title">8 依存句法分析</span>
    <span class="course-note-row__date">2026-04-24</span>
  </a>
  <a class="course-note-row" href="/notes/自然语言处理基础/9 Seq2Seq 与 Transformer/">
    <span class="course-note-row__number">9</span>
    <span class="course-note-row__title">9 Seq2Seq 与 Transformer</span>
    <span class="course-note-row__date">2026-04-24</span>
  </a>
  <a class="course-note-row" href="/notes/自然语言处理基础/10 HMM词性标注实践/">
    <span class="course-note-row__number">10</span>
    <span class="course-note-row__title">10 HMM词性标注实践</span>
    <span class="course-note-row__date">2026-05-09</span>
  </a>
  <a class="course-note-row" href="/notes/自然语言处理基础/11 形式语义与语义解析/">
    <span class="course-note-row__number">11</span>
    <span class="course-note-row__title">11 形式语义与语义解析</span>
    <span class="course-note-row__date">2026-05-12</span>
  </a>
  <a class="course-note-row" href="/notes/自然语言处理基础/12 信息检索/">
    <span class="course-note-row__number">12</span>
    <span class="course-note-row__title">12 信息检索</span>
    <span class="course-note-row__date">2026-05-12</span>
  </a>
  <a class="course-note-row" href="/notes/自然语言处理基础/13 预训练语言模型/">
    <span class="course-note-row__number">13</span>
    <span class="course-note-row__title">13 预训练语言模型</span>
    <span class="course-note-row__date">2026-05-16</span>
  </a>
  <a class="course-note-row" href="/notes/自然语言处理基础/14 GPT 缩放与上下文学习/">
    <span class="course-note-row__number">14</span>
    <span class="course-note-row__title">14 GPT 缩放与上下文学习</span>
    <span class="course-note-row__date">2026-05-23</span>
  </a>
  <a class="course-note-row" href="/notes/自然语言处理基础/15 提示学习与 RAG/">
    <span class="course-note-row__number">15</span>
    <span class="course-note-row__title">15 提示学习与 RAG</span>
    <span class="course-note-row__date">2026-05-22</span>
  </a>
  <a class="course-note-row" href="/notes/自然语言处理基础/16 训练大语言模型的数据/">
    <span class="course-note-row__number">16</span>
    <span class="course-note-row__title">16 训练大语言模型的数据</span>
    <span class="course-note-row__date">2026-05-27</span>
  </a>
  <a class="course-note-row" href="/notes/自然语言处理基础/17 后训练：从基础模型到指令助手/">
    <span class="course-note-row__number">17</span>
    <span class="course-note-row__title">17 后训练：从基础模型到指令助手</span>
    <span class="course-note-row__date">2026-06-01</span>
  </a>
  <a class="course-note-row" href="/notes/自然语言处理基础/18 NLP 任务、自动评测与 Benchmark 体系/">
    <span class="course-note-row__number">18</span>
    <span class="course-note-row__title">18 NLP 任务、自动评测与 Benchmark 体系</span>
    <span class="course-note-row__date">2026-06-04</span>
  </a>
</div>
