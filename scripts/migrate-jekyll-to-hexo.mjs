import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

const root = process.cwd();
const sourceDir = path.join(root, "source");
const textExtensions = new Set([".bib", ".css", ".html", ".json", ".md", ".svg", ".xml", ".yml", ".yaml"]);

const subjects = [
  { name: "软件设计实践", term: "2024-2025 第二学期 · 大一下", page: "_pages/notes-software-design.md" },
  { name: "数据结构与算法A", term: "2025-2026 第一学期 · 大二上", page: "_pages/notes-dsa.md" },
  { name: "AI中的编程", term: "2025-2026 第一学期 · 大二上", page: "_pages/notes-ai-programming.md" },
  { name: "可视计算与交互概论", term: "2025-2026 第一学期 · 大二上", page: "_pages/notes-vcl.md" },
  { name: "计算机视觉", term: "2025-2026 第一学期 · 大二上", page: "_pages/notes-cv.md" },
  { name: "算法设计与分析", term: "2025-2026 第二学期 · 大二下", page: "_pages/notes-algorithm-design.md" },
  { name: "自然语言处理基础", term: "2025-2026 第二学期 · 大二下", page: "_pages/notes-fnlp.md" },
  { name: "中级微观经济学", term: "2025-2026 第二学期 · 大二下", page: "_pages/notes-microeconomics.md" },
  { name: "可信机器学习", term: "2025-2026 第二学期 · 大二下", page: "_pages/notes-tml.md" },
  { name: "角色动画与运动仿真", term: "2025-2026 第二学期 · 大二下", page: "_pages/notes-mocca.md" }
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function readText(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function cleanText(text) {
  return text.replace(/[ \t]+$/gm, "");
}

function writeText(file, text) {
  const target = path.join(root, file);
  ensureDir(path.dirname(target));
  fs.writeFileSync(target, cleanText(text), "utf8");
}

function copyDir(from, to) {
  const src = path.join(root, from);
  if (!fs.existsSync(src)) return;
  fs.cpSync(src, path.join(sourceDir, to), { recursive: true });
}

function parseFrontMatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { data: {}, body: text };
  return {
    data: yaml.load(match[1]) || {},
    body: text.slice(match[0].length)
  };
}

function dumpFrontMatter(data, body) {
  const front = yaml.dump(data, {
    lineWidth: 120,
    noRefs: true,
    quotingType: "\"",
    sortKeys: false
  });
  return `---\n${front}---\n\n${body.trim()}\n`;
}

function normalizeDate(value) {
  if (!value) return undefined;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const text = String(value).trim();
  const match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!match) return text;
  return `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`;
}

function listFiles(dir, predicate) {
  const base = path.join(root, dir);
  if (!fs.existsSync(base)) return [];
  const out = [];
  const walk = current => {
    for (const name of fs.readdirSync(current)) {
      const full = path.join(current, name);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) {
        walk(full);
      } else if (!predicate || predicate(full)) {
        out.push(full);
      }
    }
  };
  walk(base);
  return out;
}

function cleanupGeneratedText() {
  for (const full of listFiles("source", file => textExtensions.has(path.extname(file)))) {
    const text = fs.readFileSync(full, "utf8");
    const cleaned = cleanText(text);
    if (cleaned !== text) {
      fs.writeFileSync(full, cleaned, "utf8");
    }
  }
}

function notePermalink(subject, basename) {
  return `/notes/${subject}/${basename}/`;
}

function rewriteMarkdownLinks(body) {
  return body
    .replace(
      /https:\/\/raw\.githubusercontent\.com\/dreaveler\/dreaveler\.github\.io\/master\/_notes\/软件设计实践\/截屏\/([^) \n]+)/g,
      (_match, filename) => `/images/notes/软件设计实践/${filename}`
    )
    .replace(/\{\{\s*'([^']+)'\s*\|\s*relative_url\s*\}\}/g, "$1")
    .replace(/\{\{\s*base_path\s*\}\}/g, "");
}

function stripJekyllPageBody(text) {
  const { body } = parseFrontMatter(text);
  return rewriteMarkdownLinks(body)
    .replace(/<div class="note-downloads">[\s\S]*?<\/div>/g, "")
    .replace(/\{% include course-notes-list\.html[^%]*%\}/g, "")
    .trim();
}

function extractDownloads(text) {
  const out = [];
  const body = parseFrontMatter(text).body;
  const re = /<a href="\{\{\s*'([^']+)'\s*\|\s*relative_url\s*\}\}">([^<]+)<\/a>/g;
  let match;
  while ((match = re.exec(body))) {
    out.push({ href: match[1], label: match[2] });
  }
  return out;
}

function markdownHasMath(body) {
  return /\$\$|\\\(|\\\[|\\begin\{/.test(body);
}

function noteSort(a, b) {
  const an = Number.isFinite(Number(a.number)) ? Number(a.number) : 999;
  const bn = Number.isFinite(Number(b.number)) ? Number(b.number) : 999;
  if (an !== bn) return an - bn;
  return a.title.localeCompare(b.title, "zh-Hans-CN");
}

function writeHexoConfigs() {
  writeText("source/about/index.md", dumpFrontMatter({
    title: "关于",
    layout: "about",
    permalink: "/about/"
  }, `
## 关于我

我是[北京大学](https://www.pku.edu.cn/)[信息科学技术学院](https://eecs.pku.edu.cn/)智能方向的一名本科生，目前处于大二下。近期主要在课程与阅读中关注 embodied AI、运动仿真与可信机器学习，也在逐步把课程笔记和阶段性项目整理到站点上。

平时喜欢跑步、打羽毛球、弹吉他，大多数运动都会一点。这个站点现在主要用于公开适合长期阅读的课程笔记、复习手册和项目说明。

## 关于笔记

将笔记开源是信科的优秀传统之一。我在旁听 CV 导论时也受益于前人的笔记，因此从大一下学期期末开始搭建这个站点，把自己整理过的课程内容逐步公开。

这些笔记仅仅是个人认为的重难点，不能全面概括也无法取代老师的课程与 PPT，供大家预习、复习用。部分笔记是面向考试的，没有对老师讲的其它内容进行完整记录。

<div class="home-link-row">
  <a class="home-link-card" href="/notes/">浏览课程笔记</a>
  <a class="home-link-card" href="https://github.com/dreaveler">GitHub</a>
  <a class="home-link-card" href="mailto:2169448673@qq.com">Email</a>
</div>
`));

  writeText("source/repositories/index.md", dumpFrontMatter({
    title: "Repositories",
    layout: "page",
    permalink: "/repositories/"
  }, `
<p class="notes-intro">我在 GitHub 上整理或正在维护的一些仓库。</p>

<div class="repo-grid">
  <a class="repo-card" href="https://github.com/dreaveler/screenshotTomd" target="_blank" rel="noopener">
    <span class="repo-card__title">screenshotTomd</span>
    <span class="repo-card__meta">dreaveler/screenshotTomd</span>
  </a>
</div>
`));

  writeText("source/net.md", dumpFrontMatter({
    title: "电脑小队网络课程主页",
    layout: "page",
    permalink: "/net.html"
  }, `
这里是北京大学信息科学技术学院 2025 秋季电脑小队网络内容培训主页。

课程讲义：[点击访问](https://steep-yamamomo-a67.notion.site/wlpx?source=copy_link)

PPT：

- [第一讲 PPT](/files/电脑小队网络第一次培训.pdf)
- [第二讲](/net2/index.html)

### 第一次课程

date: 2025.10.24

主要内容：网络入门

### 第二次课程

date: 2025.11.14

主要内容：病毒与防火墙
`));

  writeText("source/404.md", dumpFrontMatter({
    title: "404",
    layout: "404",
    permalink: "/404.html"
  }, "这个页面不存在，稍后将返回首页。"));
}

function migrateNotes() {
  const notes = [];
  for (const full of listFiles("_notes", file => file.endsWith(".md"))) {
    const rel = path.relative(path.join(root, "_notes"), full);
    const subject = rel.split(path.sep)[0];
    const basename = path.basename(full, ".md");
    const parsed = parseFrontMatter(fs.readFileSync(full, "utf8"));
    const title = parsed.data.title || basename;
    const date = normalizeDate(parsed.data.date);
    const body = rewriteMarkdownLinks(parsed.body);
    const data = {
      title,
      date,
      number: parsed.data.number,
      categories: ["课程笔记", subject],
      tags: [subject],
      permalink: notePermalink(subject, basename),
      category_bar: true
    };
    if (markdownHasMath(body)) data.math = true;
    const target = path.join("source/_posts", subject, `${basename}.md`);
    writeText(target, dumpFrontMatter(data, body));
    notes.push({ subject, basename, title, date, number: parsed.data.number, permalink: data.permalink });
  }
  return notes;
}

function migrateStaticAssets() {
  copyDir("images", "images");
  copyDir("files", "files");
  copyDir("_pages/net2", "net2");

  const noteStaticFiles = listFiles("_notes", file => !file.endsWith(".md"));
  for (const full of noteStaticFiles) {
    const rel = path.relative(path.join(root, "_notes"), full);
    const target = path.join(sourceDir, "notes", rel);
    ensureDir(path.dirname(target));
    fs.copyFileSync(full, target);
  }
}

function writeNotesPages(notes) {
  const notesBySubject = new Map();
  for (const note of notes) {
    if (!notesBySubject.has(note.subject)) notesBySubject.set(note.subject, []);
    notesBySubject.get(note.subject).push(note);
  }
  for (const items of notesBySubject.values()) items.sort(noteSort);

  const subjectMeta = new Map(subjects.map(subject => [subject.name, subject]));
  const cards = subjects.map(subject => {
    const count = (notesBySubject.get(subject.name) || []).length;
    const meta = count > 0 ? `${count} 篇站内笔记` : "外部整理稿";
    return renderNotesCard(subject.name, `/notes/${subject.name}/`, meta);
  }).join("\n");

  const grouped = new Map();
  for (const subject of subjects) {
    if (!grouped.has(subject.term)) grouped.set(subject.term, []);
    grouped.get(subject.term).push(subject);
  }

  const groups = Array.from(grouped.entries()).map(([term, groupSubjects]) => {
    const groupCards = groupSubjects.map(subject => {
      const count = (notesBySubject.get(subject.name) || []).length;
      const meta = count > 0 ? `${count} 篇站内笔记` : "外部整理稿";
      return renderNotesCard(subject.name, `/notes/${subject.name}/`, meta);
    }).join("\n");
    return `<section class="notes-semester">
  <h2>${term}</h2>
  <div class="notes-grid">
${groupCards}
  </div>
</section>`;
  }).join("\n\n");

  writeText("source/notes/index.md", dumpFrontMatter({
    title: "Notes",
    layout: "page",
    permalink: "/notes/"
  }, `
<p class="notes-intro">这些是我按课程整理的公开笔记。站内条目优先保留已经能稳定阅读、复习和回看的版本；图像较重或仍在快速变化的材料会先放在外部页面。</p>

${groups}

<section class="notes-semester">
  <h2>External</h2>
  <div class="notes-grid">
${renderNotesCard("高党复习", "https://steep-yamamomo-a67.notion.site/gd", "Notion", ' target="_blank" rel="noopener"')}
  </div>
</section>
`));

  for (const subject of subjects) {
    const items = notesBySubject.get(subject.name) || [];
    const oldPage = subject.page && fs.existsSync(path.join(root, subject.page)) ? readText(subject.page) : "";
    const intro = oldPage ? stripJekyllPageBody(oldPage) : "";
    const downloads = oldPage ? extractDownloads(oldPage) : [];
    const downloadsHtml = downloads.length > 0 ? `
<div class="note-downloads">
  <strong>下载资料</strong>
  <ul>
${downloads.map(download => `    <li><a href="${download.href}">${download.label}</a></li>`).join("\n")}
  </ul>
</div>` : "";
    const listHtml = items.length > 0 ? `
<h2>站内笔记</h2>

<div class="course-note-list">
${items.map(note => `  <a class="course-note-row" href="${note.permalink}">
    <span class="course-note-row__number">${note.number ?? ""}</span>
    <span class="course-note-row__title">${note.title}</span>
    <span class="course-note-row__date">${note.date || ""}</span>
  </a>`).join("\n")}
</div>` : "";
    writeText(`source/notes/${subject.name}/index.md`, dumpFrontMatter({
      title: subject.name,
      layout: "page",
      permalink: `/notes/${subject.name}/`
    }, `${intro}\n\n${downloadsHtml}\n\n${listHtml}`));
  }

  return cards;
}

function renderNotesCard(title, href, meta, attrs = "") {
  return `<a class="notes-card" href="${href}"${attrs}>
<span class="notes-card__title">${title}</span>
<span class="notes-card__meta">${meta}</span>
</a>`;
}

function writeCustomCss() {
  writeText("source/css/custom.css", `
.banner-text .h2 {
  font-size: clamp(1.35rem, 2.4vw, 2.35rem);
  line-height: 1.75;
}

.index-card {
  border-radius: 8px;
}

.notes-intro {
  margin: 0 0 1.6rem;
  color: #657786;
  line-height: 1.8;
}

.notes-semester {
  margin: 2rem 0;
}

.notes-semester h2 {
  margin-bottom: 1rem;
}

.notes-grid,
.repo-grid,
.home-link-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: 1rem;
}

.notes-card,
.repo-card,
.home-link-card,
.course-note-row {
  display: block;
  border: 1px solid rgba(47, 65, 84, 0.12);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.76);
  text-decoration: none !important;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
}

.notes-card,
.repo-card,
.home-link-card {
  padding: 1rem;
}

.notes-card:hover,
.repo-card:hover,
.home-link-card:hover,
.course-note-row:hover {
  border-color: rgba(33, 127, 134, 0.45);
  box-shadow: 0 12px 28px rgba(33, 45, 56, 0.12);
  transform: translateY(-2px);
}

.notes-card__title,
.repo-card__title {
  display: block;
  color: #26323d;
  font-weight: 700;
}

.notes-card__meta,
.repo-card__meta {
  display: block;
  margin-top: 0.35rem;
  color: #718096;
  font-size: 0.9rem;
}

.note-downloads {
  margin: 1.6rem 0;
  padding: 1rem 1.2rem;
  border-left: 4px solid #217f86;
  border-radius: 8px;
  background: rgba(33, 127, 134, 0.08);
}

.note-downloads ul {
  margin: 0.6rem 0 0;
}

.course-note-list {
  display: grid;
  gap: 0.65rem;
}

.course-note-row {
  display: grid;
  grid-template-columns: 3.25rem minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
}

.course-note-row__number {
  color: #e06f45;
  font-weight: 800;
}

.course-note-row__title {
  color: #26323d;
  font-weight: 700;
}

.course-note-row__date {
  color: #718096;
  font-size: 0.88rem;
}

html[data-user-color-scheme="dark"] .notes-card,
html[data-user-color-scheme="dark"] .repo-card,
html[data-user-color-scheme="dark"] .home-link-card,
html[data-user-color-scheme="dark"] .course-note-row {
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(37, 45, 56, 0.82);
}

html[data-user-color-scheme="dark"] .notes-card__title,
html[data-user-color-scheme="dark"] .repo-card__title,
html[data-user-color-scheme="dark"] .course-note-row__title {
  color: #d7dde5;
}

@media (max-width: 640px) {
  .banner-text .h2 {
    font-size: 1.1rem;
  }

  .course-note-row {
    grid-template-columns: 2.5rem minmax(0, 1fr);
  }

  .course-note-row__date {
    grid-column: 2;
  }
}
`);
}

fs.rmSync(sourceDir, { recursive: true, force: true });
ensureDir(sourceDir);
migrateStaticAssets();
writeHexoConfigs();
const notes = migrateNotes();
writeNotesPages(notes);
writeCustomCss();
cleanupGeneratedText();

console.log(`Migrated ${notes.length} notes into Hexo source.`);
