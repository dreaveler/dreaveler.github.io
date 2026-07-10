(function() {
  "use strict";

  var root = document.getElementById("personal-schedule");
  if (!root) return;

  document.body.classList.add("personal-schedule-page");

  var dayNames = ["周一", "周二", "周三", "周四", "周五"];
  var weekNames = { all: "每周", odd: "单周", even: "双周" };
  var state = { week: "all", day: 1, courseId: null };
  var scheduleData = null;

  function createElement(tag, className, text) {
    var element = document.createElement(tag);
    if (className) element.className = className;
    if (typeof text !== "undefined") element.textContent = text;
    return element;
  }

  function empty(element) {
    while (element && element.firstChild) element.removeChild(element.firstChild);
  }

  function courseById(courseId) {
    return scheduleData.courses.find(function(course) {
      return course.id === courseId;
    });
  }

  function visibleInWeek(meeting) {
    return state.week === "all" || meeting.week === "all" || meeting.week === state.week;
  }

  function meetingText(meeting) {
    return dayNames[meeting.day - 1] + " " + meeting.start + "–" + meeting.end + " 节 · " + weekNames[meeting.week] + " · " + meeting.room;
  }

  function courseMeta(course) {
    var parts = [course.code || "双学位", course.type];
    parts.push(course.credits === null ? "学分未显示" : course.credits + " 学分");
    return parts.join(" · ");
  }

  function applyCourseTone(element, course) {
    element.style.setProperty("--schedule-tone", course.tone);
    if (course.group === "dual") element.classList.add("is-dual");
  }

  function updateSelectedCourseState() {
    Array.prototype.forEach.call(root.querySelectorAll("[data-course-id]"), function(element) {
      var selected = element.getAttribute("data-course-id") === state.courseId;
      element.classList.toggle("is-selected", selected);
      if (element.tagName === "BUTTON") element.setAttribute("aria-pressed", String(selected));
    });
  }

  function selectCourse(courseId) {
    state.courseId = courseId;
    renderDetail();
    updateSelectedCourseState();

    if (window.matchMedia("(max-width: 991.98px)").matches) {
      var detailPanel = root.querySelector(".schedule-detail");
      var detailTitle = detailPanel && detailPanel.querySelector("h2");
      var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (detailPanel) detailPanel.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
      if (detailTitle) {
        detailTitle.tabIndex = -1;
        detailTitle.focus({ preventScroll: true });
      }
    }
  }

  function renderStats() {
    var target = root.querySelector("[data-schedule-stats]");
    var primary = scheduleData.courses.filter(function(course) { return course.group === "primary"; });
    var dual = scheduleData.courses.filter(function(course) { return course.group === "dual"; });
    var datedExams = scheduleData.courses.filter(function(course) { return course.exam.kind === "dated"; });
    var stats = [
      { value: scheduleData.courses.length, label: "课程总数", note: "主修 + 双学位" },
      { value: primary.length, label: "主修选课", note: "当前均待抽签" },
      { value: scheduleData.meta.primaryCredits, label: "主修学分", note: "不含双学位" },
      { value: dual.length, label: "双学位选课", note: "已计入课表" },
      { value: datedExams.length, label: "定时考试", note: "已有明确日期" }
    ];

    empty(target);
    stats.forEach(function(stat) {
      var card = createElement("article", "schedule-stat");
      card.appendChild(createElement("strong", "schedule-stat__value", stat.value));
      card.appendChild(createElement("span", "schedule-stat__label", stat.label));
      card.appendChild(createElement("small", "schedule-stat__note", stat.note));
      target.appendChild(card);
    });
  }

  function createCourseButton(course, meeting, className) {
    var button = createElement("button", className);
    button.type = "button";
    button.setAttribute("data-course-id", course.id);
    button.setAttribute("aria-pressed", String(course.id === state.courseId));
    applyCourseTone(button, course);

    button.appendChild(createElement("span", "schedule-event__name", course.shortName));
    if (meeting) {
      var meta = meeting.room + (meeting.week === "all" ? "" : " · " + weekNames[meeting.week]);
      button.appendChild(createElement("span", "schedule-event__meta", meta));
      button.setAttribute("aria-label", course.name + "，" + meetingText(meeting));
    }
    button.addEventListener("click", function() { selectCourse(course.id); });
    return button;
  }

  function renderDesktopGrid() {
    var target = root.querySelector("[data-schedule-grid]");
    var grid = createElement("div", "schedule-grid");
    grid.setAttribute("role", "region");
    grid.setAttribute("aria-label", "周一至周五，第 1 至 12 节课程表");

    var corner = createElement("div", "schedule-grid__corner", "节次");
    corner.setAttribute("aria-hidden", "true");
    grid.appendChild(corner);

    dayNames.forEach(function(day, index) {
      var header = createElement("div", "schedule-grid__day", day);
      header.style.gridColumn = String(index + 2);
      header.setAttribute("aria-hidden", "true");
      grid.appendChild(header);
    });

    for (var period = 1; period <= 12; period += 1) {
      var periodLabel = createElement("div", "schedule-grid__period", String(period));
      periodLabel.style.gridRow = String(period + 1);
      periodLabel.setAttribute("aria-hidden", "true");
      grid.appendChild(periodLabel);

      for (var day = 1; day <= 5; day += 1) {
        var cell = createElement("div", "schedule-grid__cell");
        cell.style.gridColumn = String(day + 1);
        cell.style.gridRow = String(period + 1);
        cell.setAttribute("aria-hidden", "true");
        grid.appendChild(cell);
      }
    }

    var groups = new Map();
    scheduleData.courses.forEach(function(course) {
      course.meetings.filter(visibleInWeek).forEach(function(meeting) {
        var key = [meeting.day, meeting.start, meeting.end].join("-");
        if (!groups.has(key)) groups.set(key, { meeting: meeting, entries: [] });
        groups.get(key).entries.push({ course: course, meeting: meeting });
      });
    });

    groups.forEach(function(group) {
      var meeting = group.meeting;
      var stack = createElement("div", "schedule-event-stack");
      stack.style.gridColumn = String(meeting.day + 1);
      stack.style.gridRow = String(meeting.start + 1) + " / " + String(meeting.end + 2);
      stack.setAttribute("data-count", String(group.entries.length));
      group.entries.forEach(function(entry) {
        stack.appendChild(createCourseButton(entry.course, entry.meeting, "schedule-event"));
      });
      grid.appendChild(stack);
    });

    empty(target);
    target.appendChild(grid);
  }

  function renderDayTabs() {
    var target = root.querySelector("[data-schedule-day-tabs]");
    var panel = root.querySelector("[data-schedule-day-agenda]");

    if (!target.children.length) {
      dayNames.forEach(function(day, index) {
        var dayNumber = index + 1;
        var button = createElement("button", "schedule-day-tab", day.replace("周", ""));
        button.id = "schedule-day-tab-" + dayNumber;
        button.type = "button";
        button.setAttribute("role", "tab");
        button.setAttribute("aria-label", day);
        button.setAttribute("aria-controls", "schedule-day-panel");
        button.addEventListener("click", function() {
          state.day = dayNumber;
          renderDayTabs();
          renderMobileAgenda();
        });
        button.addEventListener("keydown", function(event) {
          var nextDay = state.day;
          if (event.key === "ArrowRight") nextDay = state.day === 5 ? 1 : state.day + 1;
          else if (event.key === "ArrowLeft") nextDay = state.day === 1 ? 5 : state.day - 1;
          else if (event.key === "Home") nextDay = 1;
          else if (event.key === "End") nextDay = 5;
          else return;

          event.preventDefault();
          state.day = nextDay;
          renderDayTabs();
          renderMobileAgenda();
          target.children[nextDay - 1].focus();
        });
        target.appendChild(button);
      });
    }

    Array.prototype.forEach.call(target.children, function(button, index) {
      var selected = index + 1 === state.day;
      button.setAttribute("aria-selected", String(selected));
      button.tabIndex = selected ? 0 : -1;
      button.classList.toggle("is-active", selected);
    });
    if (panel) panel.setAttribute("aria-labelledby", "schedule-day-tab-" + state.day);
  }

  function renderMobileAgenda() {
    var target = root.querySelector("[data-schedule-day-agenda]");
    var meetings = [];

    scheduleData.courses.forEach(function(course) {
      course.meetings.filter(function(meeting) {
        return meeting.day === state.day && visibleInWeek(meeting);
      }).forEach(function(meeting) {
        meetings.push({ course: course, meeting: meeting });
      });
    });

    meetings.sort(function(left, right) {
      if (left.meeting.start !== right.meeting.start) return left.meeting.start - right.meeting.start;
      return left.meeting.week.localeCompare(right.meeting.week);
    });

    empty(target);
    if (!meetings.length) {
      target.appendChild(createElement("p", "schedule-empty", "这一天没有课程。"));
      return;
    }

    meetings.forEach(function(entry) {
      var item = createElement("article", "schedule-agenda-item");
      applyCourseTone(item, entry.course);

      var time = createElement("div", "schedule-agenda-item__time");
      time.appendChild(createElement("strong", "", entry.meeting.start + "–" + entry.meeting.end));
      time.appendChild(createElement("span", "", "节"));

      var button = createCourseButton(entry.course, null, "schedule-agenda-item__course");
      button.appendChild(createElement("span", "schedule-agenda-item__meta", entry.meeting.room + " · " + weekNames[entry.meeting.week]));
      button.setAttribute("aria-label", entry.course.name + "，" + meetingText(entry.meeting));

      item.appendChild(time);
      item.appendChild(button);
      target.appendChild(item);
    });
  }

  function renderCourseList() {
    var target = root.querySelector("[data-schedule-course-list]");
    empty(target);

    [
      { key: "primary", title: "主修选课", subtitle: "8 门 · 22 学分 · 待抽签" },
      { key: "dual", title: "双学位选课", subtitle: "2 门 · 学分未显示" }
    ].forEach(function(group) {
      var courses = scheduleData.courses.filter(function(course) { return course.group === group.key; });
      var section = createElement("section", "schedule-course-group");
      var heading = createElement("div", "schedule-course-group__head");
      heading.appendChild(createElement("h3", "", group.title));
      heading.appendChild(createElement("span", "", group.subtitle));
      section.appendChild(heading);

      var grid = createElement("div", "schedule-course-list");
      courses.forEach(function(course) {
        var button = createElement("button", "schedule-course-card");
        button.type = "button";
        button.setAttribute("data-course-id", course.id);
        button.setAttribute("aria-pressed", String(course.id === state.courseId));
        applyCourseTone(button, course);

        var titleRow = createElement("span", "schedule-course-card__title");
        titleRow.appendChild(createElement("i", "schedule-course-dot"));
        titleRow.appendChild(createElement("strong", "", course.name));
        button.appendChild(titleRow);
        button.appendChild(createElement("span", "schedule-course-card__meta", courseMeta(course)));
        button.addEventListener("click", function() { selectCourse(course.id); });
        grid.appendChild(button);
      });
      section.appendChild(grid);
      target.appendChild(section);
    });
  }

  function appendDetailRow(list, term, value) {
    var item = createElement("div", "schedule-detail-row");
    item.appendChild(createElement("dt", "", term));
    item.appendChild(createElement("dd", "", value));
    list.appendChild(item);
  }

  function renderDetail() {
    var target = root.querySelector("[data-schedule-detail]");
    var course = courseById(state.courseId);
    if (!course) return;

    empty(target);
    var kicker = createElement("div", "schedule-detail__kicker");
    kicker.appendChild(createElement("span", "schedule-detail__code", course.code || "DUAL DEGREE"));
    kicker.appendChild(createElement("span", "schedule-detail__status", course.status));
    target.appendChild(kicker);

    var title = createElement("h2", "", course.name);
    title.id = "course-detail-title";
    target.appendChild(title);
    target.appendChild(createElement("p", "schedule-detail__meta", courseMeta(course)));

    var list = createElement("dl", "schedule-detail-list");
    appendDetailRow(list, "教师", course.teacher);
    appendDetailRow(list, "上课", course.meetings.map(meetingText).join("；"));
    appendDetailRow(list, "考核", course.exam.display);
    if (course.note) appendDetailRow(list, "备注", course.note);
    target.appendChild(list);

    var accent = createElement("div", "schedule-detail__accent");
    applyCourseTone(accent, course);
    target.appendChild(accent);
  }

  function renderExams() {
    var target = root.querySelector("[data-schedule-exams]");
    var exams = scheduleData.courses.filter(function(course) {
      return course.exam.kind === "dated";
    }).sort(function(left, right) {
      return left.exam.date.localeCompare(right.exam.date);
    });

    empty(target);
    exams.forEach(function(course, index) {
      var card = createElement("button", "schedule-exam-card");
      card.type = "button";
      card.setAttribute("data-course-id", course.id);
      card.setAttribute("aria-pressed", String(course.id === state.courseId));
      applyCourseTone(card, course);

      var order = createElement("span", "schedule-exam-card__order", String(index + 1).padStart(2, "0"));
      var copy = createElement("span", "schedule-exam-card__copy");
      copy.appendChild(createElement("strong", "", course.name));
      copy.appendChild(createElement("span", "", course.exam.display));
      card.appendChild(order);
      card.appendChild(copy);
      card.addEventListener("click", function() { selectCourse(course.id); });
      target.appendChild(card);
    });
  }

  function renderWeekSwitch() {
    Array.prototype.forEach.call(root.querySelectorAll("[data-week]"), function(button) {
      var active = button.getAttribute("data-week") === state.week;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  function renderForWeek() {
    renderWeekSwitch();
    renderDesktopGrid();
    renderMobileAgenda();
    updateSelectedCourseState();
  }

  Array.prototype.forEach.call(root.querySelectorAll("[data-week]"), function(button) {
    button.addEventListener("click", function() {
      state.week = button.getAttribute("data-week");
      renderForWeek();
    });
  });

  fetch(root.getAttribute("data-source"), { cache: "no-store" })
    .then(function(response) {
      if (!response.ok) throw new Error("schedule data unavailable");
      return response.json();
    })
    .then(function(data) {
      scheduleData = data;
      state.courseId = data.courses[0] && data.courses[0].id;
      renderStats();
      renderDayTabs();
      renderCourseList();
      renderExams();
      renderDetail();
      renderForWeek();
      root.classList.add("is-ready");
    })
    .catch(function() {
      var targets = root.querySelectorAll(".schedule-loading");
      Array.prototype.forEach.call(targets, function(target) {
        target.textContent = "课表暂时无法载入，请稍后刷新。";
      });
      root.classList.add("has-error");
    });
})();
