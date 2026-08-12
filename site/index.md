---
layout: home

hero:
  name: Benjamin 的 AI 笔记
  text: 把学习沉淀成可检索的知识库
  tagline: 记录 Python、LangChain、LangGraph 与 AI Coding 的实践、思考和踩坑。
  actions:
    - theme: brand
      text: 从 LangGraph 开始
      link: /langgraph/
    - theme: alt
      text: 在 GitHub 查看源码
      link: https://github.com/Benjamindaoson/gitpagewebnote

features:
  - title: Markdown 写作
    details: 用规范 frontmatter 描述文章；栏目导航、标签、归档与 RSS 会在构建时自动生成。
  - title: 知识网络
    details: 双链、反向链接、相关内容和学习路径，将零散笔记连接成可探索的知识体系。
  - title: 自动发布
    details: 推送到 main 后，GitHub Actions 会校验内容、运行测试、构建并发布到 GitHub Pages。
---

## 如何开始写笔记

1. 使用 `npm run note:import -- "你的笔记.md"` 导入 Markdown 与同目录图片，或复制 `templates/` 中的模板手写。
2. 填写标题、栏目、标签、摘要和发布日期；侧边栏、搜索、分类、标签和归档会自动生成，无需手工修改 `sidebar`。
3. 在正文使用 `[[文章标题]]` 创建知识双链；可选填写 `series`、`sources`、`appliesTo` 和 `publishAt`。
4. 本地运行 `npm run content:check && npm run docs:build` 后提交并推送，网站会自动更新。

<RecentNotes />
