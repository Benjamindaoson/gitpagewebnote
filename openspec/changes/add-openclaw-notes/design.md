## Context

站点是 VitePress Markdown 笔记站。`CATEGORY_OPTIONS` 是类别的单一事实来源：内容校验、侧栏、分类页和导入器都由它派生。顶栏导航单独维护在 `site/.vitepress/config.mts`。当前没有 OpenClaw 类别，且发布工作流会在 `main` 推送后执行内容校验、测试和构建。

## Goals / Non-Goals

**Goals:**

- 让公开文章能够使用 `openclaw` 类别并出现在 OpenClaw 导航、侧栏、分类页、RSS 与 sitemap 中。
- 让交互式导入和收件箱导入能识别 OpenClaw 内容并补充 `OpenClaw` 标签。
- 以一篇带固定源码基线和一手来源的初学者文章启动 `OpenClaw 源码陪读` 系列。

**Non-Goals:**

- 不改变主题布局、部署工作流或内容生成的通用架构。
- 不安装新依赖、不自动定时生成文章，也不修改 OpenClaw 源码。
- 不把 README 当作完整架构设计文档；后续文章各自核验当时引用的源码与文档。

## Decisions

### 使用一等类别而非 AI Coding 标签

在 `CATEGORY_OPTIONS` 中注册 `{ value: 'openclaw', label: 'OpenClaw' }`，并在顶栏添加入口。标签不能生成独立稳定栏目，无法满足系列导航与分类发现；一等类别可自动复用现有索引、RSS 和 sitemap 行为。

### 使用多篇系列而非单篇持续膨胀的总笔记

首篇设置 `series: OpenClaw 源码陪读` 和 `seriesOrder: 1`。每个后续主题使用单独 Markdown 文章并递增序号，保留双链与系列导航。这样每篇都能锁定其事实来源与代码基线，避免一个长文混合多个版本的结论。

### 首篇只陈述 README 可证实的结论

文章将标记源码基线 `d17bbfc31a8fdc2e25cbf8f36c320656926dc70d`，并在 `sources` 中链接该提交的 README。产品定位、Gateway、入口、工具／插件、安全默认值、pnpm workspace 和 onboarding 均以 README 为界；对源码实现和架构细节仅列为后续学习路线。

## Risks / Trade-offs

- [远端 `main` 快速演进导致笔记过期] → frontmatter 记录 `appliesTo`、`updated` 和来源核验日期；新文章或修订时重新核验。
- [类别遗漏导致导航或导入不一致] → 从 `CATEGORY_OPTIONS` 派生校验、生成和导入行为，并增加站点配置与推荐元数据测试。
- [README 概括被误读为实现细节] → 首篇明确区分 README 的顶层定位和后续源码验证。

## Migration Plan

1. 注册 `openclaw` 类别并更新导航、导入推荐与管理员说明。
2. 添加并公开首篇系列文章。
3. 运行内容校验、测试和生产构建。
4. 提交并推送到 `main`；GitHub Pages 工作流发布。
5. 若发布出现异常，回滚该提交即可恢复原有四类别站点。

## Open Questions

- 无。用户已指定系列形式与直接公开发布。
