## Why

当前笔记站的栏目和页面导航需要手动维护，随着笔记增加会产生重复操作和遗漏风险。管理员还需要能将本地 Markdown 及其图片一次性导入、自动归类、校验并发布，而不需要部署带有密钥的网页后台。

## What Changes

- 建立统一的 Markdown frontmatter 内容模型，并从其生成栏目导航、标签、归档和最近更新。
- 提供本地交互式笔记导入器：以选择题收集栏目、标签、难度和发布状态，导入 Markdown 及相对图片。
- 为站点添加文章卡片、分类与标签页、归档页、阅读时间、编辑链接、RSS、站点地图和图片放大体验。
- 增加内容与链接校验，并在本地和 GitHub Actions 中运行。
- 添加笔记模板和面向管理员的操作文档。

## Capabilities

### New Capabilities

- `note-import-workflow`: 将本地 Markdown 和相对图片安全地导入站点，并可选择提交发布。
- `generated-note-navigation`: 从已发布笔记的元数据自动生成站点导航、标签、归档和更新列表。
- `note-discovery-and-quality`: 提供文章发现功能、SEO/RSS 产物与内容发布校验。

### Modified Capabilities

- `markdown-notes-site`: 将手工侧栏替换为基于 Markdown 元数据的动态站点阅读结构。
- `github-pages-deployment`: 在构建前运行内容校验，并发布新的静态发现页面和订阅产物。

## Impact

新增少量 Node.js 开发依赖和 `scripts/` 内容处理模块；所有数据继续作为 Markdown 与静态资源存放在仓库中。部署仍使用 GitHub Pages；不添加数据库、服务器或客户端密钥。
