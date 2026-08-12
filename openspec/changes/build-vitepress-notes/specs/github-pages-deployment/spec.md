## ADDED Requirements

### Requirement: GitHub Pages 自动部署

系统 SHALL 在 `main` 分支发生推送或工作流被手动触发时，安装锁定依赖、构建 VitePress 站点并将构建产物部署至 GitHub Pages。

#### Scenario: 推送触发发布

- **WHEN** 已配置 GitHub Pages 的仓库接收到推送到 `main` 分支
- **THEN** GitHub Actions 构建站点并发布 `site/.vitepress/dist` 产物

### Requirement: 部署设置说明

系统 SHALL 在 README 说明本地开发命令、如何新增笔记，以及首次在 GitHub 中启用 GitHub Actions Pages 发布。

#### Scenario: 首次部署

- **WHEN** 维护者首次将仓库推送到 GitHub
- **THEN** README 指示维护者在 Settings → Pages 中选择 GitHub Actions
