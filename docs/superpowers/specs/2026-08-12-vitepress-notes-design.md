# VitePress 笔记站设计

## 目标

在独立仓库 `gitpagewebnote` 中建立一个中文技术笔记站，发布至
`https://benjamindaoson.github.io/gitpagewebnote/`。作者只需新增 Markdown
文件和导航项，即可维护笔记，不必手写页面布局。

## 方案选择

1. **VitePress（采用）**：Markdown 原生、默认主题自带顶部导航、左侧栏、右侧大纲、
   本地搜索与深浅色模式，维护成本最低。
2. **Docsify**：无需构建，但定制与生产部署能力较弱，且搜索/主题生态不如 VitePress。
3. **手写静态 HTML**：最自由，但每篇笔记都需维护导航和目录，不适合持续积累内容。

## 架构

- `site/` 是 VitePress 的 Markdown 源目录；文件路径直接成为页面 URL。
- `site/.vitepress/config.mts` 集中声明站点标题、`/gitpagewebnote/` 基础路径、顶部导航、
  左侧栏目、右侧目录、本地搜索和 GitHub 链接。
- `site/` 下按主题分为 `python`、`langchain`、`langgraph` 与 `ai-coding`；每个主题包含
  一篇可复制的入门示例。
- `.github/workflows/deploy.yml` 在推送 `main` 时安装依赖、构建 `site/.vitepress/dist` 并
  发布到 GitHub Pages。

## 范围与约束

- 首期实现默认主题外观，达到截图所示的三栏文档阅读体验；不复制其他站点的品牌、图标
  或课程内容。
- 首期不包含评论、登录、数据库、CMS 或在线编辑器。
- 仓库首次部署需要在 GitHub Pages 设置中选择 **GitHub Actions**。
- 使用 npm 和 VitePress 稳定版；Node.js 版本要求为 20 或更高。

## 验收方式

- `npm run test` 验证站点配置包含正确 base、搜索、目录和四个导航栏目。
- `npm run docs:build` 成功生成静态站点。
- 本地预览能访问首页及 LangGraph 示例页，并显示左侧栏与右侧本页目录。
