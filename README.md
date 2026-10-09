# Benjamin Taoson · 知识书架

独立公开阅读网站，展示由真实技术笔记整理的电子书。这里不是个人简历或收费商城，所有已发布章节可免费阅读。

## 已公开电子书

- 《LangGraph 入门与控制流》：3 章，环境配置、状态图基础与控制流。
- 《OpenClaw 源码阅读手册》：当前 1 章，从固定版本 README 建立系统地图。

两本书都标为“持续更新”，不把计划中的内容当作已经完成的章节。原始 Markdown 页面保持固定地址，电子书详情页提供顺序目录以及自动生成的 EPUB 下载。

## 构建

```bash
npm ci
npm test
npm run docs:build
npm run docs:preview
```

`docs:build` 先验证笔记，再生成索引与 `site/public/ebooks/*.epub`，最后使用 VitePress 打包，保持 GitHub Pages 可用。EPUB 根据已发布章节重建，不在 Git 历史中保存过时的二进制文件。

## 增加一本电子书

在 `site/<category>/` 发布真实 Markdown 章节；更新 `scripts/book-catalog.mjs` 的书名、简介、封面色彩与章节顺序；建立 `site/books/<id>/index.md`，使用 `<BookDetail id="..." />`。运行 `npm test && npm run docs:build` 校验。
 
网站继续提供搜索、原始笔记、分类与学习索引，个人官网入口为 [Benjamin Taoson](https://benjamindaoson.github.io/daoson_website/)。
