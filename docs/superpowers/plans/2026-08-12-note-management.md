# 笔记管理与发布工作流 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让管理员以选择题式本地 CLI 导入带本地图片的 Markdown 笔记，并自动生成可发现、可校验、可部署的 VitePress 知识库。

**Architecture:** `scripts/content-index.mjs` 是内容模块的深层实现，向校验器、配置和生成器提供小型 `loadNotes`/`validateNotes`/`buildSidebar` 接口。`scripts/note-importer.mjs` 将外部 Markdown 与图片转换成该内容接口；VitePress 主题仅消费生成的内容索引，并保持阅读 UI 与写入流程隔离。

**Tech Stack:** Node.js 24、VitePress 1.6.4、Vue 3、gray-matter、Node 内置测试运行器、GitHub Actions。

## Global Constraints

- 生产基础路径必须为 `/gitpagewebnote/`，公开图片位于 `site/public/notes/<slug>/`。
- 已发布笔记必须具有 `title`、`category`、`tags`、`date`、`description` frontmatter；草稿不进入公开索引。
- 栏目仅为 `python`、`langchain`、`langgraph`、`ai-coding`。
- 导入器只能复制源 Markdown 目录内的相对 `png`、`jpg`、`jpeg`、`gif`、`webp`、`svg` 图片；绝不覆盖既有目标文件。
- CLI 的栏目、标签、难度、日期和发布方式使用编号选择；标题与摘要仅在管理员选择“自定义”时输入。
- 不存储 GitHub token、密码或任何远程写入凭据；Git 操作只调用管理员本机现有身份。

---

## File Structure

- `scripts/content-index.mjs`: 读取、规范化、验证和聚合 Markdown 元数据；生成侧栏与文章集合。
- `scripts/note-importer.mjs`: 规划和写入一次导入，复制受限图片并改写 Markdown 链接。
- `scripts/import-note.mjs`: 对管理员提供编号选择题并可选执行 Git 提交/推送。
- `scripts/generate-content.mjs`: 写入 VitePress 客户端消费的 `site/.vitepress/generated/note-index.json`。
- `scripts/validate-content.mjs`: 命令行内容质量检查入口。
- `site/.vitepress/theme/*`: 卡片、最近更新、发现页、阅读进度和图片放大 UI。
- `site/{categories,tags,archive,updates}/index.md`: 使用内容组件的静态路由入口。
- `tests/content-index.test.mjs`: 内容模型、草稿排除、导航与校验真实文件夹行为。
- `tests/note-importer.test.mjs`: 导入、图片复制、路径拒绝和冲突保护真实文件系统行为。
- `tests/content-generation.test.mjs`: 生成索引 JSON 与构建输入契约。

### Task 1: 内容模型与索引模块

**Files:**
- Create: `tests/content-index.test.mjs`
- Create: `scripts/content-index.mjs`
- Modify: `package.json`
- Modify: `site/{python,langchain,langgraph,ai-coding}/**/*.md`

**Interfaces:**
- Produces: `loadNotes({ siteDir }): Note[]`, `validateNotes({ siteDir }): ValidationIssue[]`, `buildSidebar(notes): Sidebar`, `CATEGORY_OPTIONS`。
- `Note` exposes `title`, `category`, `tags`, `date`, `description`, `difficulty`, `draft`, `url`, `sourcePath`, `readingMinutes`.

- [ ] **Step 1: Write failing content-index tests**

Use a temporary site fixture containing a published LangGraph note, a draft, and a malformed note. Assert that `loadNotes` returns only the published article, `buildSidebar` includes it under LangGraph, and `validateNotes` reports the malformed note's missing `description`.

- [ ] **Step 2: Run the focused test to verify RED**

Run: `node --test tests/content-index.test.mjs`

Expected: FAIL because `scripts/content-index.mjs` does not exist.

- [ ] **Step 3: Add gray-matter and implement the minimal index interface**

Implement recursive Markdown discovery, `draft` filtering, exact field validation, category validation, newest-first sort, stable URLs and reading-minute derivation. Do not generate pages or perform file writes in this module.

- [ ] **Step 4: Run focused test to verify GREEN**

Run: `node --test tests/content-index.test.mjs`

Expected: all assertions pass.

- [ ] **Step 5: Migrate current notes to frontmatter**

Add required metadata to each existing article; preserve each article's visible Markdown body and internal links.

### Task 2: Content generation and build-time navigation

**Files:**
- Create: `tests/content-generation.test.mjs`
- Create: `scripts/generate-content.mjs`
- Create: `scripts/validate-content.mjs`
- Modify: `site/.vitepress/config.mts`
- Modify: `package.json`, `.gitignore`

**Interfaces:**
- Consumes: `loadNotes`, `validateNotes`, `buildSidebar`.
- Produces: `site/.vitepress/generated/note-index.json`, `npm run content:generate`, `npm run content:check`.

- [ ] **Step 1: Write a failing generation test**

Create a temporary site with a valid note. Run the generator with explicit source/output directories and assert the JSON contains a hand-checked title, category, URL and reading time. Also assert a draft is absent.

- [ ] **Step 2: Verify RED**

Run: `node --test tests/content-generation.test.mjs`

Expected: FAIL because the generation module does not exist.

- [ ] **Step 3: Implement generation and validation command entrypoints**

Write the JSON only after validation has zero issues. Make `content:check` exit non-zero and print every file-specific issue. Update `docs:dev` and `docs:build` to check then generate before VitePress; ignore generated JSON from Git.

- [ ] **Step 4: Configure VitePress navigation, sitemap and SEO inputs**

Replace duplicated handwritten article items with `buildSidebar(loadNotes(...))`. Add discoverability navigation links and a sitemap hostname for the public Pages URL.

- [ ] **Step 5: Verify GREEN**

Run: `npm run content:check && npm run content:generate && node --test tests/content-generation.test.mjs`

Expected: commands pass and generated JSON contains published source articles.

### Task 3: 选择题式 Markdown 与图片导入

**Files:**
- Create: `tests/note-importer.test.mjs`
- Create: `scripts/note-importer.mjs`
- Create: `scripts/import-note.mjs`
- Create: `templates/note.md`
- Modify: `package.json`, `README.md`

**Interfaces:**
- Produces: `createImportPlan(input): ImportPlan`, `writeImport(plan): Promise<ImportResult>` and CLI `npm run note:import -- <markdown-path>`.
- `ImportPlan` has `targetNotePath`, `assetCopies`, `rewrittenMarkdown`, `metadata` and never mutates files.

- [ ] **Step 1: Write failing importer tests**

With a temporary source directory, write Markdown referencing `diagram.png`. Assert a plan writes `site/langgraph/<slug>.md`, copies `diagram.png` below `site/public/notes/<slug>/`, and rewrites the Markdown to `/gitpagewebnote/notes/<slug>/diagram.png`. Add cases for `../private.png` and an existing target file; both must reject without writing.

- [ ] **Step 2: Verify RED**

Run: `node --test tests/note-importer.test.mjs`

Expected: FAIL because importer functions do not exist.

- [ ] **Step 3: Implement import planning and write operation**

Validate source extension, normalize a Unicode-safe slug, preserve remote/data images, reject directory escapes and unsupported local assets, create frontmatter from selected metadata and copy assets only after all target conflicts are checked.

- [ ] **Step 4: Implement interactive CLI**

Present numbered menus for category, pre-defined tags, difficulty, date and publish action. Extract title/description from existing frontmatter or headings and offer numbered “use detected” / “custom” options. On publish, run content check; invoke `git add`, `git commit` and optional `git push` only for the explicitly selected action.

- [ ] **Step 5: Verify GREEN**

Run: `node --test tests/note-importer.test.mjs`

Expected: imported Markdown and copied image have the expected paths; unsafe and conflicting input remain unchanged.

### Task 4: 读者发现、阅读体验和静态产物

**Files:**
- Create: `site/.vitepress/theme/index.ts`, `site/.vitepress/theme/Layout.vue`, `site/.vitepress/theme/components/NoteList.vue`, `site/.vitepress/theme/components/RecentNotes.vue`, `site/.vitepress/theme/custom.css`
- Create: `site/categories/index.md`, `site/tags/index.md`, `site/archive/index.md`, `site/updates/index.md`
- Modify: `site/index.md`, `site/.vitepress/config.mts`

**Interfaces:**
- Consumes: `site/.vitepress/generated/note-index.json`.
- Produces: recent update cards, category/tag/archive lists, reading progress and image dialog without changing article source files.

- [ ] **Step 1: Write failing UI build contract**

Extend the generation test to require the published note's title in the generated JSON and add the four discovery route files. This catches a broken data seam before the Vue layer exists.

- [ ] **Step 2: Verify RED**

Run: `node --test tests/content-generation.test.mjs`

Expected: FAIL because discovery routes and/or generated index consumption are absent.

- [ ] **Step 3: Implement theme and discovery routes**

Create reusable list components reading the generated JSON. Render latest notes on the homepage, group published notes by category, tag and year, and attach VitePress's GitHub edit link. Extend the default theme with a scroll progress indicator and delegated image click dialog.

- [ ] **Step 4: Add RSS and sitemap output**

In the generator, emit `site/public/feed.xml` from published note metadata and configure sitemap generation for `https://benjamindaoson.github.io/gitpagewebnote/`.

- [ ] **Step 5: Verify GREEN**

Run: `npm run docs:build`

Expected: build succeeds and output contains discovery pages, `feed.xml`, `sitemap.xml` and article meta data.

### Task 5: CI, documentation and end-to-end verification

**Files:**
- Modify: `.github/workflows/deploy.yml`, `README.md`, `openspec/changes/enhance-note-management/tasks.md`
- Test: all `tests/*.test.mjs`

**Interfaces:**
- Consumes: `npm ci`, `npm run content:check`, `npm run test`, `npm run docs:build`.
- Produces: a deployment workflow that blocks invalid content and administrator instructions that use the interactive importer.

- [ ] **Step 1: Update CI before build**

Add `npm run content:check` and `npm run test` before the build step; deployment must depend on the completed build job.

- [ ] **Step 2: Document the author workflow**

Document the numbered CLI workflow, image import rules, publish choices, generated pages, local preview and recovery after a Git push failure.

- [ ] **Step 3: Mark OpenSpec implementation tasks**

Replace each completed checkbox in the change's `tasks.md` with `- [x]` only after its associated verification command succeeds.

- [ ] **Step 4: Run full verification**

Run: `npm run content:check && npm run test && npm run docs:build`

Expected: all checks exit 0.

- [ ] **Step 5: Perform local and production smoke checks**

Run local preview and verify homepage, a note, categories, tags, archive, updates, `feed.xml`, `sitemap.xml` and a fixture-imported image each return HTTP 200. After push, repeat the checks against `https://benjamindaoson.github.io/gitpagewebnote/`.
