# Benjamin 的 AI 笔记

一个用 [VitePress](https://vitepress.dev/) 构建的中文 Markdown 笔记站，发布地址为：

<https://benjamindaoson.github.io/gitpagewebnote/>

## 本地运行

要求：Node.js 20 或更高版本。

```bash
npm install
npm run docs:dev
```

打开终端提示的本地地址（通常是 <http://localhost:5173/gitpagewebnote/>）。

其他常用命令：

```bash
npm run test        # 检查站点核心配置
npm run docs:build  # 生成生产静态文件
npm run docs:preview # 本地预览构建结果
```

## 新增一篇笔记

以新增 LangGraph 笔记为例：

1. 新建 `site/langgraph/03-memory.md`。
2. 使用 Markdown 写内容：`#` 是文章标题，`##` 与 `###` 会自动出现在右侧“本页目录”。
3. 打开 `site/.vitepress/config.mts`，在 `'/langgraph/'` 对应的 `items` 中加入：

   ```ts
   { text: '03 · 记忆管理', link: '/langgraph/03-memory' }
   ```

4. 运行 `npm run docs:dev` 检查页面，再提交并推送。

新建 Python、LangChain 或 AI Coding 笔记时，沿用相同方式：把 Markdown 文件放入对应目录，并在该栏目侧栏增加链接。

## 发布到 GitHub Pages

仓库推送到 `main` 分支后，`.github/workflows/deploy.yml` 会自动构建和发布站点。

首次发布需要在 GitHub 仓库中完成一次设置：

1. 打开 **Settings → Pages**。
2. 在 **Build and deployment → Source** 选择 **GitHub Actions**。
3. 推送 `main` 分支，或在 **Actions** 页面手动运行 “Deploy VitePress site to Pages”。

发布成功后，站点地址是 <https://benjamindaoson.github.io/gitpagewebnote/>。

## 改仓库名时的必要配置

`site/.vitepress/config.mts` 的 `base` 必须与 GitHub Pages 的项目路径一致：

- 仓库名为 `gitpagewebnote`：`base: '/gitpagewebnote/'`（当前配置）
- 仓库名为 `benjamindaoson.github.io`：`base: '/'`

如果不匹配，部署后的 CSS、JavaScript、图片和站内链接可能无法正常加载。
