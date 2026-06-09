## dreaveler.github.io

这是 dreaveler 的个人主页仓库，当前站点已迁移到 Hexo + Fluid。

### 本地开发

```bash
npm install
npm run build
npm run server
```

`npm run build` 会生成 `public/`。`npm run server` 会先构建，再用本地静态服务器预览 `public/`。

### 内容结构

- `source/_posts/`：从原课程笔记迁移出的 Hexo 文章。
- `source/notes/`：课程笔记索引与课程页。
- `source/images/`、`source/files/`：站点图片与下载文件。
- `_config.yml`：Hexo 站点配置。
- `_config.fluid.yml`：Fluid 主题配置。

### 部署

GitHub Actions 会在 `master` 或 `main` 分支 push 后执行 `npm ci` 和 `npm run build`，并把 `public/` 作为 GitHub Pages artifact 发布。
