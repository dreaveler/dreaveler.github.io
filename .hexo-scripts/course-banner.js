"use strict";

// 按课程给每篇笔记设置 Fluid 顶部 banner 背景图。
// 与文章卡片 (archive-cards.js)、课程卡片 (notes/index.md) 共用同一套风景/星空素材。
//
// 用 template_locals 过滤器：它在渲染每个视图前拿到 locals.page，也就是 post.ejs 里的
// `page`，且早于主题那句 `page.banner_img = page.banner_img || theme.post.banner_img`，
// 因此能可靠地为每篇文章注入对应课程的 banner，而无需逐篇改 front-matter。
// 若文章已显式写了 banner_img 则尊重原值。

const BANNERS = "/images/banners/";

const bannerByCourse = {
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

// 兼容字符串数组、Warehouse 查询(含 forEach)与 Category 文档(含 .name)
function flattenNames(categories) {
  const out = [];
  function walk(node) {
    if (!node) return;
    if (typeof node === "string") { out.push(node); return; }
    if (Array.isArray(node) || typeof node.forEach === "function") { node.forEach(walk); return; }
    if (typeof node.name === "string") { out.push(node.name); }
  }
  walk(categories);
  return out;
}

hexo.extend.filter.register("template_locals", function(locals) {
  const page = locals.page;
  if (!page || page.layout !== "post" || page.banner_img) return locals;
  const names = flattenNames(page.categories);
  for (const name of names) {
    if (bannerByCourse[name]) {
      page.banner_img = BANNERS + bannerByCourse[name];
      break;
    }
  }
  return locals;
});
