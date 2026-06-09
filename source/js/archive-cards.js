(function() {
  "use strict";

  var list = document.querySelector(".list-group");
  if (!list || !location.pathname.startsWith("/archives/")) return;

  function normalizePath(value) {
    try {
      var path = new URL(value, location.origin).pathname;
      return path.replace(/index\.html$/, "").replace(/\/?$/, "/");
    } catch (_error) {
      return String(value || "").replace(/index\.html$/, "").replace(/\/?$/, "/");
    }
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function cssUrl(value) {
    return String(value || "/images/dreaveler.png").replace(/['"\\]/g, "");
  }

  function renderTags(tags) {
    return (tags || []).slice(0, 3).map(function(tag) {
      return '<span class="archive-card-tag">' + escapeHtml(tag) + "</span>";
    }).join("");
  }

  function renderCard(post) {
    return [
      '<a href="' + escapeHtml(post.url) + '" class="archive-card" style="--archive-card-img: url(\'' + cssUrl(post.cover) + "');\">",
      '  <article class="archive-card-inner">',
      '    <time class="archive-card-date" datetime="' + escapeHtml(post.date) + '">' + escapeHtml(post.dateText || post.date) + "</time>",
      '    <h2 class="archive-card-title">' + escapeHtml(post.title) + "</h2>",
      post.excerpt ? '    <p class="archive-card-excerpt">' + escapeHtml(post.excerpt) + "</p>" : "",
      '    <div class="archive-card-meta">',
      '      <span><i class="iconfont icon-clock-fill"></i>' + escapeHtml(post.minutes || 1) + " min read</span>",
      '      <span><i class="archive-card-lang-icon"></i>' + escapeHtml(post.lang || "Chinese") + "</span>",
      "    </div>",
      '    <div class="archive-card-tags">' + renderTags(post.tags) + "</div>",
      "  </article>",
      '  <span class="archive-card-arrow" aria-hidden="true">&rarr;</span>',
      "</a>"
    ].filter(Boolean).join("");
  }

  function upgradeArchive(data) {
    var cardsByPath = new Map();
    (data.posts || []).forEach(function(post) {
      cardsByPath.set(normalizePath(post.url), post);
    });

    var existingItems = Array.prototype.slice.call(list.querySelectorAll("a.list-group-item"));
    if (!existingItems.length) return;

    var total = list.querySelector(".h4");
    var html = '<div class="archive-card-list">';
    if (total) {
      html += '<p class="archive-total">' + escapeHtml(total.textContent.trim()) + "</p>";
    }

    var lastYear = "";
    existingItems.forEach(function(item) {
      var post = cardsByPath.get(normalizePath(item.getAttribute("href")));
      if (!post) return;
      if (post.year && post.year !== lastYear) {
        lastYear = post.year;
        html += '<p class="archive-year">' + escapeHtml(lastYear) + "</p>";
      }
      html += renderCard(post);
    });

    html += "</div>";
    list.outerHTML = html;
  }

  fetch("/archive-cards.json", { cache: "no-store" })
    .then(function(response) {
      if (!response.ok) throw new Error("archive card data unavailable");
      return response.json();
    })
    .then(upgradeArchive)
    .catch(function() {});
})();
