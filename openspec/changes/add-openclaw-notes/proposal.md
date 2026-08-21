# Change: add-openclaw-notes

## Why

站点当前的内容类别无法承载 OpenClaw 源码学习系列，读者也无法从导航、分类页和订阅入口发现这一主题。需要把经过源码版本核验的学习笔记作为公开、可持续更新的系列内容发布。

## What Changes

- 新增公开的 `OpenClaw` 内容类别及顶栏入口。
- 让内容索引、导入器和收件箱导入为该类别提供与现有类别一致的识别和校验能力。
- 发布《OpenClaw 源码陪读 01：从 README 建立系统地图》，记录产品定位、Gateway 边界、扩展模型、安全默认值和后续阅读路线。
- 更新站点的管理员内容说明，列出新增类别。

## Capabilities

### New Capabilities

- `openclaw-learning-series`: 公开发布并组织 OpenClaw 源码陪读系列，首篇从官方 README 建立系统地图。
- `openclaw-category-support`: 内容类别、站点导航与导入路径将 `openclaw` 作为一等类别处理。

### Modified Capabilities

- 无；项目尚未维护可供增量修改的基线 OpenSpec 规格。

## Impact

- Affected code: `scripts/content-index.mjs`, `scripts/note-importer.mjs`, `scripts/inbox-importer.mjs`, `site/.vitepress/config.mts`。
- Affected content: `site/openclaw/`、`README.md`、内容与站点配置测试。
- Dependencies: 无新增依赖；GitHub Pages 仍由现有 `main` 推送工作流发布。
