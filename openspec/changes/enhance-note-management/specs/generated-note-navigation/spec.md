## ADDED Requirements

### Requirement: 标准笔记元数据

系统 SHALL 将 `title`、`category`、`tags`、`date` 和 `description` 视为已发布笔记的必填 frontmatter 字段；`difficulty` 与 `draft` 为可选字段。

#### Scenario: 校验已发布笔记

- **WHEN** 内容校验器处理一篇非草稿笔记
- **THEN** 缺少任一必填字段时校验失败并标明字段名称和文件路径

### Requirement: 自动栏目导航

系统 SHALL 从非草稿笔记的 `category`、`title` 和文件路径生成栏目侧边栏，并按发布日期倒序排列文章。

#### Scenario: 新笔记进入栏目

- **WHEN** 一篇非草稿 LangGraph 笔记通过内容校验
- **THEN** 该笔记在 LangGraph 栏目的侧边栏中显示且无需手工编辑站点配置

### Requirement: 自动发现页面

系统 SHALL 从同一内容索引生成最近更新、分类、标签和年份归档页面；草稿不得出现在这些页面。

#### Scenario: 草稿隔离

- **WHEN** 笔记 frontmatter 包含 `draft: true`
- **THEN** 笔记不出现在自动导航、最近更新、分类、标签或归档中
