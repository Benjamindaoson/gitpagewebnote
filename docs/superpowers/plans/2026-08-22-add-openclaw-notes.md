# OpenClaw Notes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a public OpenClaw category and publish the first article in a versioned source-reading series.

**Architecture:** `CATEGORY_OPTIONS` remains the canonical category registry. Adding `openclaw` there propagates to content validation, generated sidebars and category views; the VitePress top navigation gets one explicit link. The first Markdown note uses standard frontmatter and is automatically included in generated discovery surfaces.

**Tech Stack:** Node.js ESM, VitePress, gray-matter, Node test runner, GitHub Pages.

**Spec:** `openspec/changes/add-openclaw-notes/`

## Global Constraints

- Preserve the current VitePress and Node dependency set; do not add dependencies.
- Use `openclaw` as the category value and `OpenClaw` as its display label.
- Publish the first article with `draft: false`, `series: OpenClaw 源码陪读`, and `seriesOrder: 1`.
- Source claims from the OpenClaw README at commit `d17bbfc31a8fdc2e25cbf8f36c320656926dc70d`.

---

### Task 1: Define and prove the OpenClaw category contract

**Files:**
- Modify: `tests/site-config.test.mjs`
- Modify: `tests/note-upgrades.test.mjs`
- Modify: `scripts/content-index.mjs`
- Modify: `scripts/note-importer.mjs`
- Modify: `scripts/inbox-importer.mjs`
- Modify: `site/.vitepress/config.mts`
- Modify: `README.md`

**Interfaces:**
- Consumes: `CATEGORY_OPTIONS` entries with `{ value, label }`.
- Produces: `openclaw` category accepted by `validateNotes`, returned by `recommendNoteMetadata`, available to importers, and exposed at `/openclaw/`.

- [ ] **Step 1: Add the failing site configuration assertion**

Add this assertion after the existing navigation assertion in `tests/site-config.test.mjs`:

```js
assert.ok(config.themeConfig.nav.some((item) => item.text === 'OpenClaw'))
assert.ok(config.themeConfig.sidebar['/openclaw/'])
```

- [ ] **Step 2: Run the focused test and verify failure**

Run: `node --test tests/site-config.test.mjs`

Expected: FAIL because navigation and sidebar do not contain `OpenClaw`.

- [ ] **Step 3: Add an OpenClaw importer recommendation test**

In `tests/note-upgrades.test.mjs`, add a test that calls `recommendNoteMetadata` with a Markdown title/body containing `OpenClaw` and asserts `category === 'openclaw'` plus inclusion of the `OpenClaw` tag.

- [ ] **Step 4: Register and route the category**

Add `{ value: 'openclaw', label: 'OpenClaw' }` to `CATEGORY_OPTIONS`; add an OpenClaw title/pattern mapping in `recommendNoteMetadata`; add an `openclaw: ['OpenClaw']` fallback in the inbox importer; add `{ text: 'OpenClaw', link: '/openclaw/' }` to VitePress navigation; and update README's category lists.

- [ ] **Step 5: Run focused tests**

Run: `node --test tests/site-config.test.mjs tests/note-upgrades.test.mjs`

Expected: PASS.

### Task 2: Publish the first source-reading lesson

**Files:**
- Create: `site/openclaw/01-readme-system-map.md`

**Interfaces:**
- Consumes: standard note frontmatter and the `openclaw` category from Task 1.
- Produces: one public article at `/openclaw/01-readme-system-map` in the `OpenClaw 源码陪读` series.

- [ ] **Step 1: Create article frontmatter**

Use this metadata:

```yaml
title: OpenClaw 源码陪读 01：从 README 建立系统地图
category: openclaw
tags: [OpenClaw, Agent, 源码阅读]
date: 2026-08-22
updated: 2026-08-22
description: 从官方 README 建立 OpenClaw 的产品边界、Gateway 中心架构与源码学习路线。
difficulty: beginner
draft: false
series: OpenClaw 源码陪读
seriesOrder: 1
appliesTo: OpenClaw main @ d17bbfc31a8fdc2e25cbf8f36c320656926dc70d
sources:
  - title: OpenClaw README（d17bbfc）
    url: https://github.com/openclaw/openclaw/blob/d17bbfc31a8fdc2e25cbf8f36c320656926dc70d/README.md
    verified: 2026-08-22
```

- [ ] **Step 2: Write the lesson body**

Use a direct beginner-oriented opening, explain the personal runtime, Gateway, entry surfaces, model/tool/skill/plugin roles, host-execution security default, pnpm workspace and onboarding sequence. State that README is an orientation document rather than a source-design document, then list later lessons: architecture, runtime path, sessions, context and memory.

- [ ] **Step 3: Run content validation**

Run: `npm run content:check`

Expected: PASS and no unknown category, source, date or series errors.

### Task 3: Verify and release

**Files:**
- Verify: changed files from Tasks 1–2

**Interfaces:**
- Consumes: category support and published article.
- Produces: a production VitePress build ready for GitHub Pages deployment.

- [ ] **Step 1: Run the complete test suite**

Run: `npm run test`

Expected: PASS.

- [ ] **Step 2: Run a production build**

Run: `npm run docs:build`

Expected: PASS and create `site/.vitepress/dist`.

- [ ] **Step 3: Inspect release scope**

Run: `git status --short` and `git diff --check`.

Expected: only OpenSpec artifacts, category support files, tests, README, and the OpenClaw article are changed; no whitespace errors.

- [ ] **Step 4: Commit and publish**

Run:

```bash
git add -- openspec/changes/add-openclaw-notes docs/superpowers/plans/2026-08-22-add-openclaw-notes.md scripts/content-index.mjs scripts/note-importer.mjs scripts/inbox-importer.mjs site/.vitepress/config.mts site/openclaw/01-readme-system-map.md tests/site-config.test.mjs tests/note-upgrades.test.mjs README.md
git commit -m "feat: publish OpenClaw source-reading series"
git push origin main
```

Expected: the existing GitHub Pages workflow validates, builds and deploys the published article.
