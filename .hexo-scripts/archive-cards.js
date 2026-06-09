"use strict";

const BANNERS = "/images/banners/";

// 每门课对应一张风景/星空背景图（与 banner、笔记卡片共用一套视觉）
const coverByCourse = {
  "算法设计与分析": "nebula.jpg",
  "可信机器学习": "galaxy.jpg",
  "AI中的编程": "starfield.jpg",
  "自然语言处理基础": "aurora.jpg",
  "中级微观经济学": "mountains.jpg",
  "角色动画与运动仿真": "clouds.jpg",
  "软件设计实践": "ocean.jpg",
  "数据结构与算法A": "desert.jpg",
  "计算机视觉": "starfield.jpg"
};

const fallbackCovers = [
  "nebula.jpg", "starfield.jpg", "aurora.jpg", "ocean.jpg",
  "mountains.jpg", "clouds.jpg", "desert.jpg", "galaxy.jpg"
].map(name => BANNERS + name);

function plainText(value) {
  return String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function collectionNames(collection) {
  const out = [];
  if (!collection || typeof collection.forEach !== "function") return out;
  collection.forEach(item => {
    if (item && item.name) out.push(item.name);
  });
  return out;
}

function courseCover(post) {
  const names = collectionNames(post.categories);
  for (const name of names) {
    if (coverByCourse[name]) return BANNERS + coverByCourse[name];
  }
  return null;
}

function chooseCover(post, index) {
  return post.cover || post.banner_img || post.thumbnail
    || courseCover(post) || fallbackCovers[index % fallbackCovers.length];
}

function readMinutes(text) {
  const compact = text.replace(/\s+/g, "");
  const asciiWords = (text.match(/[A-Za-z0-9_]+/g) || []).length;
  const cjkChars = (compact.match(/[\u3400-\u9fff]/g) || []).length;
  const units = cjkChars + asciiWords;
  return Math.max(1, Math.round(units / 420));
}

function permalink(post) {
  const path = String(post.path || "").replace(/index\.html$/, "");
  return `${hexo.config.root || "/"}${path}`.replace(/\/{2,}/g, "/");
}

hexo.extend.generator.register("archive_card_data", function(locals) {
  const posts = locals.posts
    .sort("-date")
    .map((post, index) => {
      const text = plainText(post.excerpt || post.more || post.content);
      const excerpt = post.description || text.slice(0, 126);
      const tags = collectionNames(post.tags).slice(0, 4);
      const categories = collectionNames(post.categories);

      return {
        title: post.title,
        url: permalink(post),
        date: post.date ? post.date.format("YYYY-MM-DD") : "",
        dateText: post.date ? post.date.format("MM-DD") : "",
        year: post.date ? post.date.format("YYYY") : "",
        excerpt,
        cover: chooseCover(post, index),
        minutes: readMinutes(text),
        lang: post.lang || post.language || "Chinese",
        tags: tags.length ? tags : categories.slice(-1)
      };
    });

  return {
    path: "archive-cards.json",
    data: JSON.stringify({ posts }, null, 2)
  };
});
