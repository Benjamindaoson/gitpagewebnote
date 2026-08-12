# 笔记管理与发布工作流设计

本设计使用本地 Node CLI 作为唯一管理员入口。它以编号选择题收集栏目、标签、难度和发布方式；自由文本只保留给标题与摘要。导入器把 Markdown 放入 `site/<category>/`，将合法相对图片复制至 `site/public/notes/<slug>/`，并重写图片地址。

每篇发布文章的 frontmatter 是内容模块的唯一接口：`title`、`category`、`tags`、`date`、`description` 为必填，`difficulty`、`draft` 可选。站点索引模块仅依赖这一接口，自动生成侧边栏、首页更新流、分类、标签、归档、RSS 和 sitemap。静态主题独立处理图片放大、阅读进度和卡片显示。

发布仍只依赖管理员本机的 Git 凭据和现有 GitHub Pages Actions。网站不保存 token、密码或其他写权限凭据；公开读者不能上传。
