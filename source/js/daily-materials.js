(function() {
  "use strict";

  function daySeed() {
    var now = new Date();
    return Math.floor(new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() / 86400000);
  }

  function pick(items, offset) {
    if (!Array.isArray(items) || !items.length) return null;
    return items[(daySeed() + offset) % items.length];
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function render(data) {
    var poem = pick(data.poems, 0);
    var song = pick(data.songs, 3);
    if (!poem && !song) return;

    var html = '<aside class="daily-materials" aria-label="daily materials">';
    if (poem) {
      html += [
        '<section class="daily-material-card daily-poem">',
        '  <span class="daily-material-label">每日诗句</span>',
        '  <p class="daily-material-line">' + escapeHtml(poem.line) + "</p>",
        '  <p class="daily-material-meta">' + escapeHtml(poem.title) + " · " + escapeHtml(poem.author) + "</p>",
        "</section>"
      ].join("");
    }
    if (song) {
      html += [
        '<section class="daily-material-card daily-song">',
        '  <span class="daily-material-label">每日推歌</span>',
        '  <p class="daily-material-line">' + escapeHtml(song.title) + "</p>",
        '  <p class="daily-material-meta">' + escapeHtml(song.artist) + "</p>",
        song.note ? '  <p class="daily-material-note">' + escapeHtml(song.note) + "</p>" : "",
        "</section>"
      ].filter(Boolean).join("");
    }
    html += "</aside>";

    var archiveRow = location.pathname.startsWith("/archives/") && document.querySelector("#board .row");
    if (archiveRow) {
      document.body.classList.add("archive-daily-page");
      archiveRow.insertAdjacentHTML("beforeend", '<div class="archive-daily-col">' + html + "</div>");
      return;
    }

    var main = document.querySelector("main");
    if (main) {
      main.insertAdjacentHTML("afterend", html);
    }
  }

  fetch("/data/daily-materials.json", { cache: "no-store" })
    .then(function(response) {
      if (!response.ok) throw new Error("daily materials unavailable");
      return response.json();
    })
    .then(render)
    .catch(function() {});
})();
