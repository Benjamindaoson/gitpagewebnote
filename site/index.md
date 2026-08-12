---
layout: home

hero:
  name: Benjamin 的 AI 笔记
  text: 把学习沉淀成可检索的知识库
  tagline: 记录 Python、LangChain、LangGraph 与 AI Coding 的实践、思考和踩坑。
  actions:
    - theme: brand
      text: 从 LangGraph 开始
      link: /langgraph/00-environment
    - theme: alt
      text: 在 GitHub 查看源码
      link: https://github.com/Benjamindaoson/gitpagewebnote

features:
  - title: Markdown 写作
    details: 新建一篇 .md 文件即可发布，无需手写 HTML 或维护页面布局。
  - title: 清晰的阅读体验
    details: 左侧知识导航、右侧本页目录、全文搜索与深浅色模式开箱即用。
  - title: 自动发布
    details: 推送到 main 分支后，GitHub Actions 会自动构建并发布到 GitHub Pages。
---

## 如何开始写笔记

1. 在对应栏目下新建一个 Markdown 文件，例如 `site/langgraph/03-memory.md`。
2. 用 `#` 写标题、用 `##` 和 `###` 组织章节；它们会自动出现在右侧目录中。
3. 在 `site/.vitepress/config.mts` 的 `sidebar` 中增加对应链接。
4. 提交并推送代码，站点会自动更新。

更多细节请阅读仓库根目录的 `README.md`。
