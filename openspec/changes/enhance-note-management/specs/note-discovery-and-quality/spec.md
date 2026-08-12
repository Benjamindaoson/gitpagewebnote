## ADDED Requirements

### Requirement: 读者发现与阅读体验

系统 SHALL 提供分类、标签、归档和最近更新页面，并为每篇文章提供阅读时间、GitHub 编辑链接、代码复制和可放大的内容图片。

#### Scenario: 读者通过标签发现笔记

- **WHEN** 读者打开标签页面并选择一个标签
- **THEN** 页面显示带有该标签的已发布文章及其标题、摘要、日期和栏目

### Requirement: 静态订阅与搜索引擎产物

系统 SHALL 在构建时生成 RSS feed 和 sitemap，并为已发布文章提供标题与描述 meta 信息。

#### Scenario: 生产构建

- **WHEN** 维护者运行生产构建
- **THEN** 生成的站点包含可访问的 RSS feed 和 sitemap 产物

### Requirement: 内容质量校验

系统 SHALL 提供可在本地和 CI 运行的内容校验命令，以验证 frontmatter、相对图片存在性、重复 slug 和站内 Markdown 链接。

#### Scenario: CI 阻止损坏内容

- **WHEN** GitHub Actions 构建前的内容校验失败
- **THEN** 部署工作流失败且不发布新的站点版本
