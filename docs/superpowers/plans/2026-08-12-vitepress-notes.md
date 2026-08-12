# VitePress 笔记站 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 创建一个能自动部署到 GitHub Pages 的中文 VitePress Markdown 笔记站。

**Architecture:** VitePress 将 `site/` 下的 Markdown 转为静态页面，`config.mts` 集中提供主题导航。GitHub Actions 在 `main` 更新时构建 `site/.vitepress/dist` 并交给 Pages 发布。

**Tech Stack:** Node.js 20+、npm、VitePress 1.6.4、GitHub Actions、Node 内置测试运行器。

## Global Constraints

- 生产基础路径必须为 `/gitpagewebnote/`。
- 站点源文件必须位于 `site/`，工程规格文档不得发布到站点。
- 不新增后端或运行时数据库依赖。
- 所有新功能先由 `node --test` 的失败测试定义，再写实现。

---

### Task 1: 可验证的项目骨架

**Files:**
- Create: `tests/site-config.test.mjs`
- Create: `package.json`
- Create: `.gitignore`

**Interfaces:**
- Consumes: `site/.vitepress/config.mts` 默认导出的 VitePress 配置对象。
- Produces: `npm run test`、`npm run docs:dev`、`npm run docs:build` 和 `npm run docs:preview`。

- [ ] **Step 1: 写入失败测试**

```js
import test from 'node:test'
import assert from 'node:assert/strict'

test('site configuration defines the project Pages path and documentation UI', async () => {
  const { default: config } = await import('../site/.vitepress/config.mts')
  assert.equal(config.base, '/gitpagewebnote/')
  assert.equal(config.themeConfig.search.provider, 'local')
  assert.deepEqual(config.themeConfig.outline.level, [2, 3])
  assert.equal(config.themeConfig.nav.length, 5)
})
```

- [ ] **Step 2: 运行测试确认失败**

Run: `node --test tests/site-config.test.mjs`

Expected: 因 `site/.vitepress/config.mts` 不存在而失败。

- [ ] **Step 3: 创建 npm 工作流与忽略规则**

```json
{
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test",
    "docs:dev": "vitepress dev site",
    "docs:build": "vitepress build site",
    "docs:preview": "vitepress preview site"
  },
  "devDependencies": { "vitepress": "^1.6.4" }
}
```

- [ ] **Step 4: 安装依赖**

Run: `npm install`

Expected: 生成 `package-lock.json` 并安装 VitePress。

### Task 2: VitePress 配置和初始笔记

**Files:**
- Create: `site/.vitepress/config.mts`
- Create: `site/index.md`
- Create: `site/python/index.md`
- Create: `site/langchain/index.md`
- Create: `site/langgraph/00-environment.md`
- Create: `site/ai-coding/index.md`

**Interfaces:**
- Consumes: VitePress 1.6.4 的 `defineConfig` API。
- Produces: 三栏中文文档页面和五项顶部导航。

- [ ] **Step 1: 最小化实现配置**

```ts
import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/gitpagewebnote/',
  themeConfig: {
    search: { provider: 'local' },
    outline: { level: [2, 3] },
    nav: [{ text: '首页', link: '/' }]
  }
})
```

- [ ] **Step 2: 运行测试确认通过**

Run: `npm run test`

Expected: 配置测试通过。

- [ ] **Step 3: 扩展配置并编写示例笔记**

为所有五个栏目添加导航；用 Markdown 的一级、二级和三级标题构成首页和四篇示例笔记；为各主题提供可点击侧栏项目。

- [ ] **Step 4: 运行构建**

Run: `npm run docs:build`

Expected: exit code 为 0，且 `site/.vitepress/dist/index.html` 与 `site/.vitepress/dist/langgraph/00-environment.html` 存在。

### Task 3: 发布与维护文档

**Files:**
- Create: `.github/workflows/deploy.yml`
- Create: `README.md`

**Interfaces:**
- Consumes: `npm ci` 和 `npm run docs:build`。
- Produces: 推送 `main` 自动发布的 Pages 工作流，以及新增笔记的作者说明。

- [ ] **Step 1: 编写部署工作流**

工作流必须在 `main` 的 push 和 `workflow_dispatch` 时运行，授权 `pages: write` 与 `id-token: write`，并上传 `site/.vitepress/dist`。

- [ ] **Step 2: 编写 README**

README 必须列出安装、开发、构建、预览、新增笔记和首次 Pages 设置步骤，并说明 `base` 必须与仓库名一致。

- [ ] **Step 3: 运行完整验证**

Run: `npm run test; npm run docs:build`

Expected: 两个命令都成功。

- [ ] **Step 4: 启动预览并进行 HTTP 冒烟检查**

Run: `npm run docs:preview -- --host 127.0.0.1 --port 4173`

Expected: `http://127.0.0.1:4173/gitpagewebnote/` 和
`http://127.0.0.1:4173/gitpagewebnote/langgraph/00-environment` 返回 HTTP 200。
