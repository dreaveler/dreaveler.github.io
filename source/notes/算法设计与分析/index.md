---
title: 算法设计与分析
layout: page
permalink: /notes/算法设计与分析/
---

这里收录的是我根据课堂内容、课程资料、Notion 课堂笔记与复习材料整理的《算法设计与分析》笔记。当前既有一篇导论笔记，先把“算法、复杂度与可计算性”的课程地图搭起来，也同步了期中复习总结、“分治策略”“动态规划、贪心与回溯”、往年真题练习集、网络流、NP 完全理论与归约构件进阶、近似算法与度量 TSP / 背包近似方案、随机算法中的 Las Vegas / Monte Carlo / 指纹法、Miller-Rabin 素数检验与随机复杂度类，以及期末往年题考点总结，覆盖从常见算法设计范式到复杂性理论、可证明次优解、概率化算法分析、处理难解问题的策略和考前题型自查的主线。

除了站内分主题条目，我也把完整课程笔记和一份适合考前快速通读的整理版 PDF 放在这里，方便按“课程主线”或“题型模板 + 典型结论”的方式回看：


<div class="note-downloads">
  <strong>下载资料</strong>
  <ul>
    <li><a href="/files/算法设计与分析课程笔记.pdf">算法设计与分析课程笔记 PDF</a></li>
    <li><a href="/files/算法设计与分析期中复习总结.pdf">算法设计与分析期中复习总结 PDF</a></li>
    <li><a href="/files/算法设计与分析期末往年题考点总结.pdf">算法设计与分析期末往年题考点总结 PDF</a></li>
  </ul>
</div>


<h2>站内笔记</h2>

<div class="course-note-list">
  <a class="course-note-row" href="/notes/算法设计与分析/0 导论：算法、复杂度与可计算性/">
    <span class="course-note-row__number">0</span>
    <span class="course-note-row__title">0 导论：算法、复杂度与可计算性</span>
    <span class="course-note-row__date">2026-03-02</span>
  </a>
  <a class="course-note-row" href="/notes/算法设计与分析/1 期中复习总结/">
    <span class="course-note-row__number">1</span>
    <span class="course-note-row__title">1 期中复习总结</span>
    <span class="course-note-row__date">2026-04-21</span>
  </a>
  <a class="course-note-row" href="/notes/算法设计与分析/2 分治策略/">
    <span class="course-note-row__number">2</span>
    <span class="course-note-row__title">2 分治策略</span>
    <span class="course-note-row__date">2026-04-23</span>
  </a>
  <a class="course-note-row" href="/notes/算法设计与分析/3 动态规划、贪心与回溯/">
    <span class="course-note-row__number">3</span>
    <span class="course-note-row__title">3 动态规划、贪心与回溯</span>
    <span class="course-note-row__date">2026-04-25</span>
  </a>
  <a class="course-note-row" href="/notes/算法设计与分析/4 往年真题练习集/">
    <span class="course-note-row__number">4</span>
    <span class="course-note-row__title">4 往年真题练习集</span>
    <span class="course-note-row__date">2026-04-27</span>
  </a>
  <a class="course-note-row" href="/notes/算法设计与分析/5 NP 完全理论/">
    <span class="course-note-row__number">5</span>
    <span class="course-note-row__title">5 NP 完全理论</span>
    <span class="course-note-row__date">2026-05-16</span>
  </a>
  <a class="course-note-row" href="/notes/算法设计与分析/6 NP 完全理论进阶/">
    <span class="course-note-row__number">6</span>
    <span class="course-note-row__title">6 NP 完全理论进阶：归约、构件与优化问题</span>
    <span class="course-note-row__date">2026-05-18</span>
  </a>
  <a class="course-note-row" href="/notes/算法设计与分析/7 网络流：最大流最小割与典型应用/">
    <span class="course-note-row__number">7</span>
    <span class="course-note-row__title">7 网络流：最大流最小割与典型应用</span>
    <span class="course-note-row__date">2026-05-24</span>
  </a>
  <a class="course-note-row" href="/notes/算法设计与分析/8 近似算法：从 NP 难到可证明的次优解/">
    <span class="course-note-row__number">8</span>
    <span class="course-note-row__title">8 近似算法：从 NP 难到可证明的次优解</span>
    <span class="course-note-row__date">2026-05-25</span>
  </a>
  <a class="course-note-row" href="/notes/算法设计与分析/9 近似算法进阶：度量 TSP 与背包近似方案/">
    <span class="course-note-row__number">9</span>
    <span class="course-note-row__title">9 近似算法进阶：度量 TSP 与背包近似方案</span>
    <span class="course-note-row__date">2026-05-27</span>
  </a>
  <a class="course-note-row" href="/notes/算法设计与分析/10 随机算法：Las Vegas、Monte Carlo 与指纹法/">
    <span class="course-note-row__number">10</span>
    <span class="course-note-row__title">10 随机算法：Las Vegas、Monte Carlo 与指纹法</span>
    <span class="course-note-row__date">2026-06-04</span>
  </a>
  <a class="course-note-row" href="/notes/算法设计与分析/11 期末往年题考点总结/">
    <span class="course-note-row__number">11</span>
    <span class="course-note-row__title">11 期末往年题考点总结</span>
    <span class="course-note-row__date">2026-06-07</span>
  </a>
  <a class="course-note-row" href="/notes/算法设计与分析/12 随机算法进阶：Miller-Rabin 与难解问题策略/">
    <span class="course-note-row__number">12</span>
    <span class="course-note-row__title">12 随机算法进阶：Miller-Rabin 与难解问题策略</span>
    <span class="course-note-row__date">2026-06-08</span>
  </a>
</div>
