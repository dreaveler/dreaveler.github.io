import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const POSTS_DIR = join(ROOT, "source/_posts");
const MANIFEST_PATH = join(ROOT, "source/images/banners/gallery/manifest.json");

async function listMarkdown(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await listMarkdown(path));
    if (entry.isFile() && entry.name.endsWith(".md")) out.push(path);
  }
  return out;
}

function frontMatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return null;
  return { raw: match[0], body: match[1], rest: text.slice(match[0].length) };
}

function readField(body, field) {
  const match = body.match(new RegExp(`^${field}:\\s*"?([^"\\n]+)"?\\s*$`, "m"));
  return match ? match[1].trim() : "";
}

function writeBanner(body, banner) {
  if (/^banner_img:\s*.*$/m.test(body)) {
    return body.replace(/^banner_img:\s*.*$/m, `banner_img: ${banner}`);
  }
  if (/^permalink:\s*.*$/m.test(body)) {
    return body.replace(/^(permalink:\s*.*)$/m, `$1\nbanner_img: ${banner}`);
  }
  if (/^date:\s*.*$/m.test(body)) {
    return body.replace(/^(date:\s*.*)$/m, `$1\nbanner_img: ${banner}`);
  }
  return `banner_img: ${banner}\n${body}`;
}

const manifest = JSON.parse(await readFile(MANIFEST_PATH, "utf8"));
const files = await listMarkdown(POSTS_DIR);
const posts = [];

for (const path of files) {
  const text = await readFile(path, "utf8");
  const fm = frontMatter(text);
  if (!fm) continue;
  posts.push({
    path,
    text,
    fm,
    date: readField(fm.body, "date"),
    title: readField(fm.body, "title"),
    permalink: readField(fm.body, "permalink")
  });
}

posts.sort((a, b) => {
  const date = String(b.date).localeCompare(String(a.date));
  if (date) return date;
  return relative(POSTS_DIR, a.path).localeCompare(relative(POSTS_DIR, b.path));
});

if (manifest.length < posts.length) {
  throw new Error(`Need at least ${posts.length} gallery images, found ${manifest.length}.`);
}

for (const [index, post] of posts.entries()) {
  const banner = manifest[index].path;
  const body = writeBanner(post.fm.body, banner);
  const next = `---\n${body}\n---\n${post.fm.rest}`;
  await writeFile(post.path, next);
  console.log(`${String(index + 1).padStart(2, "0")} ${banner} ${relative(ROOT, post.path)}`);
}

console.log(`Assigned unique banner images to ${posts.length} posts.`);
