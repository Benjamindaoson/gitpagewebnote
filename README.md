# Benjamin 的 AI 笔记网站：小白使用手册

这是一个把本地 Markdown 笔记发布成网站的项目。你平时只需要写 Markdown；网站会自动按栏目、标签、时间归档整理它们。

- 网站：<https://benjamindaoson.github.io/gitpagewebnote/>
- GitHub 仓库：<https://github.com/Benjamindaoson/gitpagewebnote>

> **第一次使用，只记住这一条：** 双击根目录的 `打开管理台.cmd`，在浏览器里选择笔记文件夹，填写信息，然后点击 **“导入并推送发布”**。不需要手动把笔记塞进 `site`，也不需要自己输入 Git 命令。

## 先理解：笔记放哪里？网站又放哪里？

把你平时写作的原始笔记放在任何你习惯的位置，例如：

```text
D:\我的笔记\LangGraph 状态管理\
├─ 状态管理入门.md
└─ assets\
   └─ state-graph.png
```

**日常不要直接把原始笔记放进 `site`。** 正常情况下，把这个“笔记文件夹”交给管理台；管理台会复制一份可发布版本到项目中：

| 内容 | 管理台自动存放的位置 | 你需要手动放吗？ |
| --- | --- | --- |
| 发布后的 Markdown | `site/<栏目>/<文章文件名>.md` | 不需要 |
| 发布后的本地图片 | `site/public/notes/<文章文件名>/` | 不需要 |
| 你原来的 Markdown、图片 | 仍在你选择的原始文件夹 | 不会移动、不删除 |

原始笔记是写作素材；`site/` 是网站的发布副本。导入成功后，GitHub 会保存发布副本，因此也是一份可恢复的备份。

## 第一次准备（只做一次）

1. 安装 [Node.js 20 或更高版本](https://nodejs.org/)；安装时保留默认选项。
2. 安装 Git for Windows；如果你已能向本仓库推送代码，说明已安装。
3. 打开项目根目录：其中应有 `package.json`、`site`、`打开管理台.cmd`。
4. 第一次在此目录的 PowerShell 中运行：

   ```powershell
   npm ci
   ```

5. 双击 `打开管理台.cmd`。浏览器会自动打开 `http://127.0.0.1:4318/`。

不要关闭弹出的黑色命令窗口；关闭它就关闭了管理台。管理台只在你的电脑 `127.0.0.1` 上运行，选文件时不会先上传到第三方服务。只有点击“导入并推送发布”后，网站笔记才会推送到 GitHub。

## 方法一：用本地笔记管理台上传并发布（最推荐）

适合日常写一篇、发一篇。

### 1. 准备一篇 Markdown

最简单的笔记只需要标题和正文：

```md
# LangGraph 状态管理入门

这篇笔记解释 StateGraph 怎样保存和传递状态。

![状态图](assets/state-graph.png)
```

图片放在 Markdown 同级或子文件夹中，并使用相对路径，例如 `assets/state-graph.png`。支持 `png`、`jpg`、`jpeg`、`gif`、`webp`、`svg`；网络图片（`https://...`）可直接保留。不要使用 `../` 指向笔记文件夹之外。

### 2. 选择笔记文件夹

1. 双击 `打开管理台.cmd`。
2. 在浏览器中点击虚线框，选择**包含 Markdown 和图片的整个文件夹**；也可以把整个文件夹拖进虚线框。
3. 若文件夹里有多篇 Markdown，在“要导入的 Markdown”下拉框中选择本次要发布的文章。

管理台会尝试从一级标题和正文自动填写标题、摘要和栏目。请检查并修改：

- **栏目**：Python、LangChain、LangGraph、OpenClaw、AI Coding；选最贴合主题的一项。
- **标题**：网站显示的标题，也是自动生成文件名的依据。不能与已有文章重名。
- **标签**：用英文逗号分隔，例如 `LangGraph, Agent, Python`。
- **难度**：入门、进阶、高级。
- **发布日期**：通常填今天；它决定文章排序和归档年份。
- **摘要**：列表页显示的一句话，建议写清文章解决什么问题。

### 3. 先预览，再保存或发布

| 按钮 | 会发生什么 | 是否上 GitHub |
| --- | --- | --- |
| **查看变更预览** | 只列出将创建的文章、图片和路径；不写入项目 | 否 |
| **导入草稿** | 写入项目，但文章为草稿，不会显示在公开网站 | 否 |
| **导入并推送发布** | 写入、校验、创建 Git 提交并 `git push` | 是 |

首次建议先点“查看变更预览”。确认文件路径、图片数量、栏目和标签正确后，点击“导入并推送发布”，在确认框中选择确定。

成功后 GitHub Actions 会自动检查、构建和发布。通常等待 1–3 分钟，刷新网站即可；若没有更新，打开仓库的 **Actions** 页面，查看最新工作流是否为绿色成功状态。

> 管理台一次最多读取 100 个文件、总大小最多 50 MB。图片太多或太大时，先减少文件或压缩图片。

## 方法二：命令行逐篇导入（可选择草稿、公开或定时）

在项目根目录运行：

```powershell
npm run note:import -- "D:\我的笔记\LangGraph 状态管理\状态管理入门.md"
```

程序会依次询问标题、摘要、栏目、标签、难度、日期和发布状态。之后还可以选择启动本地预览、创建 Git 提交、推送到 GitHub。每一步都能停止，文件会保留在本地。

## 方法三：一次导入一个文件夹的多篇笔记

```powershell
npm run note:import-folder -- "D:\我的笔记\2026-09"
```

程序会递归找到文件夹及子文件夹中的所有 `.md`，并**一篇一篇**让你确认信息。适合批量整理旧笔记；第一次建议先拿 1–2 篇测试。

## 方法四：收件箱批量导入（固定流程时使用）

项目有收件箱文件夹 `note/inbox/`。把待整理的 Markdown（及相对图片）复制到这里，再双击 `导入笔记.cmd`，或运行：

```powershell
npm run note:inbox
```

它会自动补全标题、摘要、栏目和标签，并导入为**草稿**；不会自动创建 Git 提交或推送。确认后按下一节的“手动提交和推送”发布。刚开始使用时，优先用方法一，因为它会在发布前让你逐项确认。

## 已经导入的笔记：怎么修改、怎么删除？

### 修改已发布笔记

1. 找到文章：`site/<栏目>/<文章文件名>.md`。
2. 用任意 Markdown 编辑器修改正文或文件开头的信息。
3. 若换了本地图片，也放进该文章的 `site/public/notes/<文章文件名>/`，并更新图片链接。
4. 在项目根目录运行：

   ```powershell
   npm run content:check
   npm run docs:dev
   ```

5. 打开终端显示的地址（通常是 `http://localhost:5173/gitpagewebnote/`）确认后，再提交推送。

如果你通过管理台再次导入同标题笔记，导入器会保护旧文章并拒绝覆盖。此时请直接编辑已有的 `site/...md`，或换标题作为新文章。

### 删除已发布笔记

删除 Markdown 和对应图片目录，再提交：

```powershell
git rm "site\langgraph\状态管理入门.md"
git rm -r "site\public\notes\状态管理入门"
git commit -m "docs: remove 状态管理入门"
git push
```

把示例路径改成实际路径。推送后 GitHub Pages 重建，文章会从网站消失。

## 手动提交和推送（草稿转发布、手动修改后必用）

在项目根目录运行：

```powershell
git status
git add site
git commit -m "docs: 更新笔记"
git push
```

先看 `git status`，确认没有不想上传的文件，再执行后面三行。第一次若 Git 要求登录，请在弹出的浏览器中授权拥有 `Benjamindaoson/gitpagewebnote` 写入权限的账号。

`git push` 成功表示内容已到 GitHub；网页还要等待 Actions 自动部署。

## 本地文件删了，如何从 GitHub 恢复？

### 整个项目删了，或换电脑

在你想存放项目的父目录中打开 PowerShell：

```powershell
git clone https://github.com/Benjamindaoson/gitpagewebnote.git
cd gitpagewebnote
npm ci
```

然后双击 `打开管理台.cmd`，或运行 `npm run admin`。这会恢复 GitHub 上**最后一次已推送**的完整项目和笔记。`node_modules` 不会下载是正常的；`npm ci` 会按 `package-lock.json` 重装它。

### 只误删了一个文件，且还没有提交

如果它以前提交过，可以恢复：

```powershell
git restore "site\langgraph\状态管理入门.md"
```

不确定路径时先运行 `git status`。从未提交、从未推送到 GitHub 的本地文件无法从 GitHub 恢复；原始笔记应另外放在自己的笔记库或云盘中。

### 误删后已经推送

在 GitHub 提交历史找到删除前的提交编号，然后运行：

```powershell
git restore --source <删除前的提交编号> -- "site\langgraph\状态管理入门.md"
git add site
git commit -m "docs: restore 状态管理入门"
git push
```

如文章有图片，也要恢复 `site/public/notes/` 下对应的图片目录。

## 直接手写发布文件（进阶，不推荐第一次使用）

可复制 `templates/note.md`，保存到正确栏目，例如 `site/langgraph/我的文章.md`。公开文章至少要有：

```md
---
title: 文章标题
category: langgraph
tags: [LangGraph, Agent]
date: 2026-09-01
description: 用一句话说明这篇笔记解决的问题。
difficulty: beginner
draft: false
---

# 正文从这里开始
```

栏目只允许：`python`、`langchain`、`langgraph`、`openclaw`、`ai-coding`。`draft: true` 的文章保留在仓库中，但不显示在公开导航、RSS 或 sitemap。正文可以用 `[[另一篇文章标题]]` 创建站内双链；标题必须唯一。

写完后运行：

```powershell
npm run content:check
npm run docs:build
```

再提交并推送。

## 常用命令速查

```powershell
npm ci                                  # 第一次安装依赖
npm run admin                           # 打开本地笔记管理台
npm run note:import -- "D:\路径\文章.md"  # 逐篇交互式导入
npm run note:import-folder -- "D:\笔记文件夹" # 批量逐篇导入
npm run note:inbox                      # 导入 note/inbox 中的笔记为草稿
npm run content:check                   # 检查元数据、图片、链接、重复路由
npm run test                            # 自动化测试
npm run docs:dev                        # 本地网站预览
npm run docs:build                      # 生产构建
git status                              # 查看本次变更
```

## 常见问题

### 双击管理台没有打开网页

先在 PowerShell 中运行 `node -v` 确认 Node 已安装；在项目根目录运行 `npm ci` 后再运行 `npm run admin`。若浏览器没有自动打开，手动访问命令窗口显示的 `http://127.0.0.1:4318/`。

### 点击“导入并推送发布”失败

结果框会显示具体原因。常见原因是 GitHub 未登录、账号没有仓库写入权限、网络无法访问 GitHub，或同名文章已存在。先运行 `git status`；若为 Git 认证问题，按提示完成浏览器授权后再试。

### 网站没有新文章或图片

检查文章是否为草稿（`draft: true`）、发布日期是否在未来、图片链接是否正确。运行 `npm run content:check`。若已推送，等待 Actions 最新部署变绿后再刷新网站。

### 可以把 `node_modules` 上传到 GitHub 吗？

不要上传。它是可重建的依赖缓存，已由 `.gitignore` 排除。GitHub 要保存的是 `package.json`、`package-lock.json`、`site/`、脚本和配置；重新下载项目后运行 `npm ci` 即可恢复依赖。

## 自动生成的阅读入口

- `/updates/`：最近更新
- `/categories/`：按栏目浏览
- `/tags/`：按标签浏览
- `/archive/`：按年份归档
- `/feed.xml`：RSS
- `/sitemap.xml`：站点地图
- `/knowledge-map/`：文章双链知识地图

推送到 `main` 后，`.github/workflows/deploy.yml` 会校验内容、运行测试、构建并部署 GitHub Pages。不要在项目中保存 GitHub Token、密码或其他私密信息。
