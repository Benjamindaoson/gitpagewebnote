## Context

现有 VitePress 站点为四个主题栏目提供手工配置的侧栏和示例笔记。站点已经能通过 GitHub Pages 自动发布，但新增一篇笔记仍要求作者手动选择目录、调整导航、处理图片路径和执行 Git 操作。

目标用户是唯一管理员 Benjamin。公开读者只能阅读，无法上传。管理员希望在本机通过选择题导入一篇本地 Markdown 笔记（含本地图片），让它自动进入正确栏目、出现在导航和发现页中，并选择是否立即发布。

## Goals / Non-Goals

**Goals:**

- 用一个短小且可验证的 frontmatter 接口描述文章；从该接口派生全部导航与发现页。
- 用交互式本地 CLI 导入 Markdown 与同目录相对图片，避免手动放置文件和改链接。
- 所有选项型字段以编号选择题呈现；只有标题、摘要等真正自由文本才要求输入。
- 导入时校验标题、栏目、日期、标签、图片与站内链接；避免不完整内容被发布。
- 用静态方式增强读者体验：分类、标签、归档、更新流、RSS、SEO、编辑链接、图片查看。
- GitHub Actions 复用校验，并在构建成功后发布。

**Non-Goals:**

- 不在 GitHub Pages 页面中保存 GitHub Token、管理员密码或任何可写仓库凭据。
- 不支持网页端上传、多人角色、数据库、评论系统或远程资产托管。
- 首期不自动抓取网络图片；远程图片 URL 保持原样。
- 首期不将任意电脑路径递归复制到仓库；只接受与 Markdown 文件相对引用的图片。

## Decisions

### 1. 采用本地 Node CLI，而非网页后台

`scripts/import-note.mjs` 作为管理员唯一入口，运行 `npm run note:import -- <Markdown 路径>`。它使用当前本机已登录的 Git 身份；不会在仓库、网页或构建日志中出现凭据。流程末尾给出编号选择：仅导入、导入并创建 Git 提交、导入并提交推送。

替代方案包括：

- GitHub 网页上传：安全但仍需手动分类、处理图片和维护导航。
- 静态网页直连 GitHub API：必须将具有写权限的 token 暴露给浏览器，拒绝。
- 带 OAuth 的独立后台：可以站内上传，但需要长期维护外部服务和认证回调，超出当前静态站点需求。

### 2. 以 frontmatter 作为内容模块的唯一接口

所有发布笔记都使用以下必填字段：`title`、`category`、`tags`、`date`、`description`。可选字段为 `difficulty` 和 `draft`。栏目值固定为 `python`、`langchain`、`langgraph`、`ai-coding`，由 CLI 的编号选择题提供。

导入器、内容校验器和 VitePress 数据加载器都只依赖此接口。路径、导航标题、文章卡片、日期排序、RSS 项和 SEO 描述从 frontmatter 推导，避免多个地方重复维护同一信息。

### 3. 图片导入采用受限复制与重写

导入器扫描 Markdown 图片语法 `![alt](relative/path.png)`：

1. 远程 URL、锚点和 data URL 不变。
2. 相对本地路径必须解析到源 Markdown 所在目录内，且扩展名属于 `png`、`jpg`、`jpeg`、`gif`、`webp` 或 `svg`。
3. 合法图片复制到 `site/public/notes/<slug>/`；同名冲突使用来源文件名并失败提示重命名，不静默覆盖。
4. 文中的路径重写为 `/gitpagewebnote/notes/<slug>/<file-name>`。

该规则提供安全的资源边界，同时让构建后的站点可通过 GitHub Pages 正确加载图片。

### 4. 用内容索引模块派生站点页面

`scripts/content-index.mjs` 读取所有 `site/**/*.md`，排除首页、生成页、草稿和 `.vitepress`。模块返回稳定排序的文章对象和派生数据（每栏目文章、标签计数、按年归档、最近文章）。VitePress 的 build-time data loader 将其渲染为：

- 首页最近更新；
- `/categories/` 分类页；
- `/tags/` 标签页；
- `/archive/` 年份归档页；
- 自动侧边栏。

侧栏通过同一索引生成而非维护两份列表。手工栏目入口页保留为“专题介绍”，文章链接由索引附加。

### 5. 小型客户端增强保持独立

自定义主题仅处理图片点击放大、文章阅读进度和文章卡片样式。它不负责内容解析或写入，以保持站点 UI 与发布工作流之间的清晰 seam。RSS、sitemap 与 meta 标签在构建时生成；内容质量在 CLI/CI 中检查。

## Data Flow

```text
本地 Markdown + 相对图片
  -> import-note CLI（选择题、frontmatter、复制、路径重写）
  -> site/<category>/<slug>.md + site/public/notes/<slug>/
  -> validate-content CLI
  -> Git commit/push（可选）
  -> GitHub Actions: validate -> VitePress build -> GitHub Pages
  -> content-index -> 侧栏、分类、标签、归档、首页、RSS、sitemap
```

## Risks / Trade-offs

- [原 Markdown 没有 frontmatter] → CLI 根据选择题生成；已有笔记由兼容性默认值补齐或按说明迁移。
- [图片文件名冲突] → 导入失败且说明冲突文件，管理员可重命名后重试，绝不覆盖已有图片。
- [不存在的图片/链接] → 本地校验失败；仅导入模式不发布，修复后重试。
- [自动生成导航破坏人工专题页] → 索引只追加文章项，固定栏目入口保留在配置中。
- [Git 推送失败] → 文件保留在本地工作区，CLI 展示 Git 原始错误并不回滚或删除内容。
- [文章数量增长] → 索引在构建时运行；当前静态笔记规模下足够。大量内容时再引入增量缓存。

## Migration Plan

1. 新增内容模型、索引、校验器和测试；现有示例笔记补充标准元数据。
2. 添加导入 CLI、模板和图片导入测试；默认仅导入，发布由选择题显式授权。
3. 添加发现页面、主题增强、RSS、sitemap 与 Actions 校验。
4. 构建并预览；导入一个临时 fixture 笔记及图片以验证完整路径。
5. 推送 `main` 后确认线上新页面、RSS 和图片均可访问。

## Open Questions

- 无。管理员采用本地 CLI，且 Markdown 相对图片必须一并导入。
