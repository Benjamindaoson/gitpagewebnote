## Context

该仓库目前为空。目标是独立发布到 GitHub Pages 的项目子路径，而不是替换
`benjamindaoson.github.io` 个人主页。用户希望获得截图所示的长期可维护文档阅读体验。

## Goals / Non-Goals

**Goals:**

- 让 Markdown 笔记以响应式三栏文档页面呈现。
- 在 GitHub 推送后自动发布。
- 让新增一篇笔记只涉及新增 `.md` 文件和一处导航配置。

**Non-Goals:**

- 不实现后端、账号、评论、CMS、专有品牌复刻或从其他网站搬运内容。

## Decisions

### 使用 VitePress 默认主题

VitePress 默认主题已经提供所需的导航、侧栏、页内大纲、搜索和主题切换，避免为文档
站重新实现 UI。Docsify 不需要构建但更依赖运行时脚本；自定义 HTML 的维护负担更大。

### 将站点源文件置于 `site/`

规格和实施文档继续在 `docs/`，笔记站的 Markdown 源文件放在 `site/`，以防工程管理
文档被意外发布为公开页面。

### 固定 GitHub Pages 项目路径

站点配置使用 `base: '/gitpagewebnote/'`。这是项目页面的资源和链接前缀；若以后将仓库
改名为 `benjamindaoson.github.io`，必须将其改为 `/`。

### 使用 GitHub Actions 部署

工作流使用 `actions/configure-pages`、`actions/upload-pages-artifact` 和
`actions/deploy-pages` 构建并部署，发布逻辑可审计且无需将构建结果提交到分支。

## Risks / Trade-offs

- [仓库尚未创建] → 使用 GitHub CLI 创建公开仓库并设置远程；若同名仓库已存在，改为添加远程。
- [Pages 未启用 GitHub Actions] → README 提供一次性设置步骤。
- [栏目增加但未更新侧栏] → README 明确新增笔记的两步操作，并用配置测试保护核心栏目。
- [项目路径改变] → README 说明 `base` 与仓库名的对应关系。

## Migration Plan

1. 本地初始化、验证和提交站点。
2. 创建/关联 `Benjamindaoson/gitpagewebnote` 公共仓库并推送 `main`。
3. 在仓库 Pages 设置中选择 GitHub Actions，等待工作流发布。
4. 若需回滚，回退到上一个 Git 提交并推送；GitHub Pages 将自动重新发布该版本。

## Open Questions

- 无；站点标题暂定为“Benjamin 的 AI 笔记”，后续可在配置文件中自行修改。
