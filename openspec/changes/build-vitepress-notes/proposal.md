## Why

现有目录没有可发布的笔记展示层，普通 GitHub Markdown 页面也无法提供稳定的栏目导航、页内目录和搜索体验。建立独立的静态笔记站后，作者可持续用 Markdown 管理公开技术笔记。

## What Changes

- 初始化 VitePress 中文笔记站与 npm 工作流。
- 提供首页、四个主题栏目和可复制的 Markdown 示例笔记。
- 配置顶部导航、侧边栏、本地搜索、右侧页内目录、暗色模式和 GitHub 链接。
- 添加 GitHub Pages 自动构建和发布工作流。
- 编写使用说明与站点配置自动化检查。

## Capabilities

### New Capabilities

- `markdown-notes-site`: 从 Markdown 生成可导航的中文笔记网站。
- `github-pages-deployment`: 将站点构建产物发布到 GitHub Pages。

### Modified Capabilities

- 无。

## Impact

新增 Node.js/VitePress 开发依赖、`site/` 内容目录、GitHub Actions 工作流和项目文档；不影响现有个人主页仓库。
