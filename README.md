# Benjamin 的 AI 笔记

一个用 [VitePress](https://vitepress.dev/) 构建的中文 Markdown 笔记站。

- 公开网站：<https://benjamindaoson.github.io/gitpagewebnote/>
- 源码仓库：<https://github.com/Benjamindaoson/gitpagewebnote>

站点会从笔记 frontmatter 自动生成栏目侧栏、首页最近更新、分类、标签、年度归档、RSS 和 sitemap。读者无需登录；只有本机有 Git 写入权限的管理员能够导入和发布笔记。

## 管理员：导入一篇 Markdown 笔记

在仓库根目录运行：

```powershell
npm run note:import -- "D:\我的笔记\LangGraph 状态管理.md"
```

导入器会用编号选择题让你选择：

1. 是否采用自动检测到的标题；只有选“自定义”才需输入标题。
2. 是否采用自动提取的摘要；只有选“自定义”才需输入摘要。
3. 栏目：Python、LangChain、LangGraph 或 AI Coding。
4. 标签：可一次选择多个编号，例如 `3,4`。
5. 难度、发布日期和公开/草稿状态。
6. 导入后操作：仅导入、导入并提交、导入并提交推送。

选择“导入、提交并推送”后，GitHub Actions 会自动检查、构建并发布网站。

### Markdown 与本地图片规则

Markdown 可以直接引用与它同目录或子目录中的相对图片：

```md
![状态图](assets/state-graph.png)
```

导入器会自动：

- 将笔记放到正确栏目，例如 `site/langgraph/langgraph-state-management.md`；
- 将图片复制到 `site/public/notes/langgraph-state-management/`；
- 将图片链接改为 GitHub Pages 可访问的地址；
- 自动补齐规范 frontmatter；
- 拒绝 `../` 目录外路径、非图片文件和重名覆盖。

支持 `png`、`jpg`、`jpeg`、`gif`、`webp`、`svg`。网络图片 URL 保持不变。若 Git 提交或推送失败，已导入的文件会保留在本地工作区；修复 Git 问题后可手动提交，文件不会丢失。

## 手写笔记

可复制 [templates/note.md](templates/note.md) 作为起点。已发布文章必须包含：

```md
---
title: 文章标题
category: langgraph
tags: [LangGraph, Agent]
date: 2026-08-12
description: 用一句话说明这篇笔记解决的问题。
difficulty: beginner
draft: false
---
```

允许的 `category` 是：`python`、`langchain`、`langgraph`、`ai-coding`。`draft: true` 的文章会留在仓库中，但不出现在公开导航、搜索发现页、RSS 或 sitemap。

## 本地开发与检查

要求：Node.js 20 或更高版本。

```bash
npm install
npm run content:check   # 检查元数据、相对图片、链接与重复路由
npm run test            # 运行内容、导入、生成和站点构建测试
npm run docs:dev        # 本地开发服务器，通常为 http://localhost:5173/gitpagewebnote/
npm run docs:build      # 生成生产静态文件
npm run docs:preview    # 本地预览构建结果
```

## 自动生成的阅读入口

- `/updates/`：最近更新
- `/categories/`：按栏目浏览
- `/tags/`：按标签浏览
- `/archive/`：按年份归档
- `/feed.xml`：RSS 订阅
- `/sitemap.xml`：搜索引擎站点地图

## GitHub Pages 发布

推送到 `main` 后，`.github/workflows/deploy.yml` 会先执行内容校验与测试，再构建和发布。首次配置已使用 **Settings → Pages → GitHub Actions** 完成。

`site/.vitepress/config.mts` 的 `base` 必须与仓库名一致：当前仓库为 `gitpagewebnote`，因此配置是 `base: '/gitpagewebnote/'`。如果未来改为 `benjamindaoson.github.io` 个人主页仓库，请改为 `base: '/'`。
