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

(function() {
  "use strict";

  var cards = Array.prototype.slice.call(document.querySelectorAll(".index-card"));
  if (!cards.length) return;

  function normalizePath(value) {
    try {
      return new URL(value, location.origin).pathname.replace(/index\.html$/, "").replace(/\/?$/, "/");
    } catch (_error) {
      return String(value || "").replace(/index\.html$/, "").replace(/\/?$/, "/");
    }
  }

  function cssUrl(value) {
    return String(value || "").replace(/['"\\]/g, "");
  }

  fetch("/archive-cards.json", { cache: "no-store" })
    .then(function(response) {
      if (!response.ok) throw new Error("archive card data unavailable");
      return response.json();
    })
    .then(function(data) {
      var coverByPath = new Map();
      (data.posts || []).forEach(function(post) {
        if (post.url && post.cover) coverByPath.set(normalizePath(post.url), post.cover);
      });

      cards.forEach(function(card) {
        var link = card.querySelector(".index-header a");
        if (!link) return;
        var cover = coverByPath.get(normalizePath(link.getAttribute("href")));
        if (cover) card.style.setProperty("--index-card-img", "url('" + cssUrl(cover) + "')");
      });
    })
    .catch(function() {});
})();
