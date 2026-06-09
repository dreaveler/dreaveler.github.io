(function() {
  "use strict";

  var startedAt = document.querySelector("#site-started-at");
  var runtime = document.querySelector("#site-runtime-days");
  if (!startedAt || !runtime) return;

  var startDate = startedAt.getAttribute("data-start-date") || startedAt.getAttribute("datetime");
  if (!startDate) return;

  var start = new Date(startDate + "T00:00:00+08:00");
  if (Number.isNaN(start.getTime())) return;

  var now = new Date();
  var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  var days = Math.max(1, Math.floor((today.getTime() - start.getTime()) / 86400000) + 1);
  runtime.textContent = " · 已运行 " + days + " 天";
})();
