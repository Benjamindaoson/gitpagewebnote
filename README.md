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
3. 栏目：Python、LangChain、LangGraph、OpenClaw 或 AI Coding。
4. 标签：可一次选择多个编号，例如 `3,4`。
5. 难度、发布日期和公开/草稿状态。
6. 导入后会显示变更预览，并依次选择本地预览、提交和推送。

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

允许的 `category` 是：`python`、`langchain`、`langgraph`、`openclaw`、`ai-coding`。`draft: true` 的文章会留在仓库中，但不出现在公开导航、搜索发现页、RSS 或 sitemap。

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
- `/knowledge-map/`：按双链关系查看知识地图

## 发布预览、知识网络与读者互动

导入器写入 Markdown 和图片后，会先显示目标文件、栏目、标签、图片数量及新增文件清单。接着依次用编号选择是否启动本地预览、创建 Git 提交、推送到 GitHub Pages；任何一步选择“不继续”都只保留本地文件。

文章可选使用以下字段：

```yaml
updated: 2026-08-12
featured: true
series: LangGraph 入门路径
seriesOrder: 1
changeLog:
  - date: 2026-08-12
    summary: 增加环境变量排错说明。
publishAt: 2026-09-01
appliesTo: LangGraph 1.x
sources:
  - title: 官方文档
    url: https://example.com/docs
    verified: 2026-08-12
```

正文中的 `[[文章标题]]` 或 `[[文章标题|显示文字]]` 会生成站内双链；页面自动显示反向链接、相关文章和课程的上一篇/下一篇。标题必须唯一，双链不能指向草稿，系列序号不能重复。

`publishAt` 为未来日期时，文章会保持隐藏；每日 GitHub Actions 会重新构建，在日期到达后自动公开。文章页提供“我已学完本篇”，完成状态只存入读者当前浏览器。`npm run content:check` 会提示超过 180 天未复核的公开内容，但不会阻止构建。

`templates/` 中提供教程、踩坑记录、项目复盘、工具对比和源码解读五类模板。

### 内容健康与批量导入

```powershell
npm run content:report                 # 待复核、无来源、孤立文章报告
npm run note:import-folder -- "D:\我的笔记" # 逐篇交互式批量导入
```

读者可在“我的学习”中查看本机的已完成与稍后阅读内容。文章同时生成 canonical、Open Graph、Twitter 卡片与 JSON-LD 结构化数据。

站点默认提供 RSS 订阅和 GitHub Issues 反馈入口。若要启用免费的 GoatCounter 访问统计和 Giscus 评论，请先分别创建服务并把它们给出的公开标识填入 `site/.vitepress/theme/engagement.mjs`：

1. 在 [GoatCounter](https://www.goatcounter.com/) 创建站点，将站点代码填入 `goatCounterCode`。
2. 在 GitHub 仓库启用 Discussions，按 [Giscus 配置页](https://giscus.app/zh-CN) 为本仓库创建 Discussion 分类；将 `repo`、`repoId`、`category`、`categoryId` 填入 `giscus`。

这些值是前端公开标识，不要填入 GitHub Token、密码或任何私密密钥。空值表示关闭，站点仍可正常构建和运行。

## GitHub Pages 发布

推送到 `main` 后，`.github/workflows/deploy.yml` 会先执行内容校验与测试，再构建和发布。首次配置已使用 **Settings → Pages → GitHub Actions** 完成。

`site/.vitepress/config.mts` 的 `base` 必须与仓库名一致：当前仓库为 `gitpagewebnote`，因此配置是 `base: '/gitpagewebnote/'`。如果未来改为 `benjamindaoson.github.io` 个人主页仓库，请改为 `base: '/'`。
