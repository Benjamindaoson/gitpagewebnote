## ADDED Requirements

### Requirement: Markdown 笔记站渲染

系统 SHALL 使用 VitePress 从 `site/` 目录中的 Markdown 文件构建静态笔记站，并使用
`/gitpagewebnote/` 作为生产基础路径。

#### Scenario: 构建站点

- **WHEN** 维护者运行 `npm run docs:build`
- **THEN** 系统在 `site/.vitepress/dist` 生成可部署的静态站点

### Requirement: 文档阅读导航

系统 SHALL 提供首页、Python、LangChain、LangGraph 和 AI Coding 顶部栏目，并在桌面页面
提供左侧文档栏和基于二、三级标题生成的右侧本页目录。

#### Scenario: 阅读 LangGraph 笔记

- **WHEN** 读者打开 LangGraph 示例笔记
- **THEN** 页面显示该栏目左侧导航以及由页面二、三级标题生成的本页目录

### Requirement: 笔记站可发现性

系统 SHALL 提供本地全文搜索、深浅色主题切换和指向 GitHub 仓库的链接。

#### Scenario: 搜索笔记

- **WHEN** 读者在站点搜索框输入已发布笔记的标题
- **THEN** 搜索结果包含相应笔记页面
