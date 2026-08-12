# 个人技术笔记站竞品分析

> 范围：与本仓库的「VitePress + GitHub Pages + 本地 Markdown/图片导入器」方案比较。资料仅引用产品方官方文档或官网；价格和功能以 2026-08-12 可见信息为准。

## 结论先行

当前方案不应试图成为 GitBook 或 Notion 的在线协作产品。它最有竞争力的定位是：**个人拥有 Git 仓库与静态产物，离线写 Markdown，使用本地选择题式导入器将 Markdown 与图片一次发布，并以零持续 SaaS 费用获得可定制的公开技术笔记站。**

最值得借鉴的体验是：

1. 借鉴 Notion / GitBook 的低摩擦发布：把栏目、标签、草稿、发布操作做成明确选择，不暴露路径和配置。
2. 借鉴 Obsidian Publish 的知识网络：加强双链、反向链接和关系图，而不是仅扩展普通分类页。
3. 借鉴 GitBook 的预览与协作心智：在本地导入后提供构建预览、变更摘要和发布确认；多人协作再评估 GitBook。
4. 保持 VitePress，不为 Material 或 Docusaurus 迁移：二者功能很强，但分别增加 Python 或 React/MDX 心智成本，不能直接解决本项目的管理员导入问题。

## 横向比较

| 方案 | 内容创作与管理员发布 | 搜索 | 定制与所有权 | 官方价格信息 | 最适合谁 |
| --- | --- | --- | --- | --- | --- |
| **当前 VitePress + GitHub Pages** | 本地 Markdown；本项目已有 CLI 导入 Markdown 和同目录图片，校验、提交、Actions 发布。发布者保有本地文件和 Git 历史。 | VitePress 本地索引（当前站点已启用）；无需外部服务。 | Vue/TS/CSS 全量可改，仓库和生成站点归自己；需自行维护构建与工作流。 | VitePress/GitHub Pages 之外无必需 SaaS；域名等另计。 | 想长期沉淀个人技术内容、愿意保有代码与 Git 的个人作者。 |
| **Notion Sites** | 可批量导入 Markdown/HTML/DOCX/PDF/纯文本；在 Notion 编辑后 `Share → Publish` 即上线，已发布页面的内容修改会自动更新。注意：发布父页面时，子页面默认一并公开。 | 付费站点可开启访客站内搜索；免费版可开启搜索引擎索引（外部收录最长可达四周）。 | 付费计划可改主题、favicon、导航、分享预览、SEO，并接 Google Analytics；自定义域名是付费计划的附加购项。内容托管于 Notion，可导出 Markdown/HTML/CSV 和上传文件，但官方不支持将导出内容一键恢复为原工作区。 | 免费版可发布无限站点、一个 `notion.site` 域名；自定义域名 add-on 为 $10/域名/月，年付折 $8。 | 不写代码、重视最快发布和数据库/协作编辑的个人或小团队。 |
| **GitBook** | 可导入 Markdown/HTML/DOCX/Notion/Confluence，支持块编辑器、GitHub/GitLab 双向 Git Sync；团队可走编辑→评审→合并的 Change Request，合并后更新线上文档。 | 站内关键词搜索；Premium 及以上有 AI 搜索，Ultimate 有 Assistant。 | 免费版仅基础配色、圆角、明暗切换；品牌、域名、字体等随计划开放。不能直接插自定义 CSS/HTML/JS 或重排页面元素，且不能去除 GitBook 标识；Git Sync 能保留 Markdown 源码。 | 个人 Free 为 $0（含 1 位免费用户）；Premium 年付 $65/站点/月 + $12/用户/月；Ultimate $249/站点/月 + $12/用户/月。 | 产品文档、API 文档、需要评审/多人协作/企业权限且预算充足的团队。 |
| **Obsidian Publish** | 在本地 vault 中写 Markdown；Publish 插件中勾选未发布笔记后发布，移动端也能发布。可邀请协作者；Headless CLI（公开 beta）可把本地 vault 接入站点并发布。 | 官网列为 full-text search，另有图谱、悬浮预览和堆叠页面，特别适合双链笔记。 | 可自定义 CSS/JavaScript、域名、密码；托管和 4GB 站点容量由 Obsidian 提供，原始 vault 仍在本地。 | $8/站点/月（年付）或 $10/月付；含 4GB 托管、域名/主题定制和 SEO。 | 已经以 Obsidian 写作、重视双链知识库体验并接受订阅的个人作者。 |
| **Docusaurus** | Git 中的 Markdown/MDX + front matter；MDX 可嵌 React 组件。需要 Git/CI 发布，并非给非技术管理员的可视化 CMS。 | 官方首选 Algolia DocSearch；技术文档/技术博客可免费申请，但依赖爬虫，重大变更后可能要重新爬取。也可用社区 Local Search。 | React/插件生态、可自定义组件；官方强调无 vendor lock-in，静态部署可到 GitHub Pages 等。 | Docusaurus 官方为免费；Algolia 或托管等外部服务可能另有条件/费用。 | React 团队、需要文档版本、多语言、交互式 MDX 组件的产品文档。 |
| **MkDocs Material** | Python 工具链中的 Markdown + `mkdocs.yml`；本地 `serve` 实时预览、`build` 生成静态站后部署。没有原生管理员上传 UI。 | 内置 search 插件，浏览器端 Lunr 索引，不需要外部服务；支持将内容排除/加权。 | 开源 MIT；配置可改颜色、字体、图标、logo，且官方强调完整源码和输出归作者所有。 | 社区版开源；Insiders 为赞助计划，非必需。 | Python 用户、偏好成熟文档主题和离线/客户端搜索的技术文档作者。 |

## 对当前产品的可执行启发

### 1. 优先增强“发布器”，而不是添加网页后台

竞品的核心优势是少步骤：Notion 的一键发布、GitBook 的站点向导、Obsidian 的勾选发布。当前的安全边界（静态 Pages、不保存 GitHub Token）是正确的，下一版应把本地导入器固化为：

- 首屏仅给出“导入笔记 / 新建笔记 / 检查站点 / 预览站点 / 提交发布”五项编号菜单；
- 导入结束显示“目标路径、复制图片数、识别标签、会新增的导航项、将执行的 Git 命令”；
- 默认先本地预览，二次确认才 `git commit && git push`；
- 给每个失败的图片链接和 front matter 字段可操作的修复提示。

这会复刻 SaaS 的低门槛，而不引入网页写入权限、数据库或服务端 Token。

### 2. 做出 Obsidian 式知识连接（高价值差异）

在现有 front matter 与内容索引上增加：`related`、反向链接、系列上一篇/下一篇、可选关系图。文章页可显示“引用本文 / 继续阅读”，标签页继续保留为发现入口。这样最能服务“笔记”而不只是“文档”。

### 3. 补齐 GitBook 式发布信心

保留 GitHub Actions 的生产发布，在本地新增：导入后的变更预览、构建成功提示、图片大小/格式提示、草稿不进入 RSS/sitemap。多人协作真正出现后，再引入 PR 模板和预览部署；不要在单人阶段承担 GitBook 的订阅成本。

### 4. 明确不做或后置的能力

- **可视化在线编辑、实时协作、细粒度角色、OAuth 站点访问**：这是 Notion/GitBook 的平台能力，需要后端与安全审计，不适合当前纯静态架构。
- **AI 站内问答**：GitBook 的 AI 搜索/Assistant 是付费产品能力；当前先确保本地全文搜索、元数据和链接正确，后续可用可替换的外部搜索/问答服务。
- **框架迁移**：Docusaurus 的优势依赖 React/MDX，Material 的优势依赖 Python 配置；本项目已在 Vue/VitePress 上实现核心需求，迁移会增加维护成本而不提升导入体验。

## 一手资料

- [Notion：发布 Notion Site](https://www.notion.com/help/public-pages-and-web-publishing)、[功能与计划](https://www.notion.com/help/notion-sites-availability-and-pricing)、[站点定制](https://www.notion.com/help/edit-and-customize-your-notion-sites)
- [Notion：导入与迁移](https://www.notion.com/help/import-data-into-notion)、[导出/备份边界](https://www.notion.com/help/back-up-your-data)
- [GitBook：发布文档站](https://gitbook.com/docs/publishing-documentation/publish-a-docs-site)、[内容导入](https://gitbook.com/docs/getting-started/import)、[Change Requests](https://gitbook.com/docs/collaboration/change-requests)、[Git Sync](https://gitbook.com/docs/integrations/git-sync)、[定制边界](https://gitbook.com/docs/publishing-documentation/customization)、[官方定价](https://www.gitbook.com/pricing)
- [Obsidian Publish 产品页](https://obsidian.md/publish)、[发布笔记](https://obsidian.md/help/publish/publish)、[Headless Publish CLI](https://obsidian.md/help/publish/headless)、[官方定价](https://obsidian.md/pricing)
- [Docusaurus 介绍与能力](https://docusaurus.io/docs)、[Markdown/MDX](https://docusaurus.io/docs/markdown-features)、[搜索](https://docusaurus.io/docs/search)、[部署](https://docusaurus.io/docs/deployment)
- [Material for MkDocs 概览](https://squidfunk.github.io/mkdocs-material/)、[建站/构建](https://squidfunk.github.io/mkdocs-material/creating-your-site/)、[内置搜索](https://squidfunk.github.io/mkdocs-material/plugins/search/)、[发布到 GitHub Pages](https://squidfunk.github.io/mkdocs-material/publishing-your-site/)
