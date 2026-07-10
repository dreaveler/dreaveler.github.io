---
title: 我的课表
subtitle: 2026–2027 学年 · 第一学期
layout: page
permalink: /schedule/
banner_img: /images/banners/galaxy.jpg
banner_img_height: 58
banner_mask_alpha: 0.55
---

<div id="personal-schedule" class="course-schedule" data-source="/data/schedule-2026-fall.json">
  <section class="schedule-hero" aria-labelledby="schedule-overview-title">
    <div class="schedule-hero__content">
      <p class="schedule-eyebrow">PKU · 2026 FALL</p>
      <h2 id="schedule-overview-title">一周，在课间展开</h2>
      <p class="schedule-hero__lead">这里收拢本学期的主修与双学位选课。用单双周筛选看真实到课安排，点开任意课程即可查看教师、地点与考核信息。</p>
      <div class="schedule-hero__badges" aria-label="课表状态">
        <span>8 门主修待抽签</span>
        <span>2 门双学位选课</span>
        <span>周四 5–6 节单双周轮换</span>
      </div>
    </div>
    <div class="schedule-hero__mark" aria-hidden="true">
      <span>COURSE MAP</span>
      <strong>10</strong>
      <small>courses</small>
    </div>
  </section>
  <section class="schedule-stats" data-schedule-stats aria-label="课表概览">
    <div class="schedule-loading">正在整理课表…</div>
  </section>
  <section class="schedule-panel schedule-week" aria-labelledby="weekly-schedule-title">
    <header class="schedule-section-head">
      <div>
        <p class="schedule-eyebrow">WEEKLY PLAN</p>
        <h2 id="weekly-schedule-title">周课表</h2>
        <p>按节次排列；单双周课程会随筛选切换。</p>
      </div>
      <div class="schedule-week-switch" role="group" aria-label="选择周次">
        <button type="button" data-week="all" aria-pressed="true">总览</button>
        <button type="button" data-week="odd" aria-pressed="false">单周</button>
        <button type="button" data-week="even" aria-pressed="false">双周</button>
      </div>
    </header>
    <div class="schedule-desktop" data-schedule-grid aria-live="polite">
      <div class="schedule-loading">课表载入中…</div>
    </div>
    <div class="schedule-mobile" aria-label="手机课表视图">
      <div class="schedule-day-tabs" data-schedule-day-tabs role="tablist" aria-label="选择星期"></div>
      <div id="schedule-day-panel" class="schedule-day-agenda" data-schedule-day-agenda role="tabpanel" tabindex="0" aria-live="polite"></div>
    </div>
  </section>
  <div class="schedule-content-grid">
    <section class="schedule-panel schedule-courses" aria-labelledby="course-index-title">
      <header class="schedule-section-head schedule-section-head--compact">
        <div>
          <p class="schedule-eyebrow">COURSE INDEX</p>
          <h2 id="course-index-title">课程索引</h2>
          <p>主修 22 学分；双学位课程学分尚未显示。</p>
        </div>
      </header>
      <div data-schedule-course-list></div>
    </section>
    <aside class="schedule-panel schedule-detail" aria-labelledby="course-detail-title" aria-live="polite" aria-atomic="true">
      <p class="schedule-eyebrow">COURSE DETAIL</p>
      <div data-schedule-detail>
        <h2 id="course-detail-title">课程详情</h2>
        <p class="schedule-muted">选择一门课程查看详情。</p>
      </div>
    </aside>
  </div>
  <section class="schedule-panel schedule-exams" aria-labelledby="exam-radar-title">
    <header class="schedule-section-head schedule-section-head--compact">
      <div>
        <p class="schedule-eyebrow">EXAM RADAR</p>
        <h2 id="exam-radar-title">考试节点</h2>
        <p>目前结果中有 5 场考试给出了明确日期。</p>
      </div>
    </header>
    <div class="schedule-exam-list" data-schedule-exams></div>
  </section>
  <aside class="schedule-source-note">
    <strong>数据说明</strong>
    <span>整理自校内选课结果与课表视图。主修课程当前均为“待抽签”；两门双学位课程按本人确认计入课表。页面只保留课程安排，不保存 Cookie、学号或登录信息。</span>
    <time datetime="2026-07-10">整理于 2026-07-10</time>
  </aside>
  <noscript>
    <section class="schedule-fallback">
      <h2>课程清单</h2>
      <ul>
        <li>多模态学习：周一 3–4 节；周四 5–6 节（单周）</li>
        <li>计算机网络：周一 5–6 节；周三 1–2 节</li>
        <li>集合论与图论：周二 3–4 节；周四 5–6 节（双周）</li>
        <li>生成模型基础：周二 1–2 节（双周）；周五 3–4 节</li>
        <li>太极拳：周一 7–8 节</li>
        <li>机器学习：周二 7–9 节</li>
        <li>影视中的英美文化：周四 7–8 节</li>
        <li>毛泽东思想和中国特色社会主义理论体系概论：周一 10–11 节</li>
        <li>人工智能管理学（双学位）：周二 10–12 节</li>
        <li>经济学原理（双学位）：周四、周五 10–11 节</li>
      </ul>
    </section>
  </noscript>
</div>
