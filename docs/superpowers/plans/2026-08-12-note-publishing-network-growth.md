# Note Publishing, Knowledge Network and Reader Growth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add preview-first publishing, a validated wiki-link knowledge network, operational metadata, and optional reader engagement to the static notes site.

**Architecture:** Extend the Node content index with normalized metadata and a resolved graph, serialize it into the existing generated JSON, and have focused Vue components consume it. Keep importing, rendering, and optional third-party client scripts isolated in their current layers.

**Tech Stack:** Node.js ESM, `node:test`, gray-matter, VitePress, Vue 3, GitHub Pages.

## Global Constraints

- Markdown/frontmatter remains the only content source; no backend, database, email capture, private token, or secret is added.
- Engagement scripts load only when their complete public configuration is present.
- Drafts cannot enter generated discovery data, feeds, maps, series, relationships, or engagement widgets.

---

### Task 1: Build the validated content graph

**Files:** `scripts/content-index.mjs`, `scripts/generate-content.mjs`, `tests/content-index.test.mjs`, `tests/content-generation.test.mjs`

**Interfaces:** `buildKnowledgeNetwork(notes)` returns normalized notes with `updated`, `featured`, `changeLog`, `wikiLinks`, `backlinks`, `relatedNotes`, `seriesPrevious`, `seriesNext`, and a public `series` array. `validateNotes` rejects invalid links and duplicate series ordering.

- [x] Write tests for resolved wiki links/backlinks, invalid/ambiguous/draft wiki links, related ranking, series ordering, and updated feed/map dates.
- [x] Run `node --test tests/content-index.test.mjs tests/content-generation.test.mjs` and verify the new tests fail because the graph is absent.
- [x] Implement normalized metadata, wiki-link replacement data, backlinks, related-note ranking, series grouping, validation, and graph generation.
- [x] Run the focused tests, then `npm run test`.
- [x] Commit with `feat: add validated note knowledge network`.

### Task 2: Make importing preview-first

**Files:** `scripts/note-importer.mjs`, `scripts/import-note.mjs`, `tests/note-importer.test.mjs`, `README.md`

**Interfaces:** `summarizeImportPlan(plan)` returns target path, category, tags, image count and created-file list. `runInteractiveImport` asks preview, commit, and push questions independently after import.

- [x] Write tests for the import summary, no Git action after preview/decline, and staged commit/push selections.
- [x] Run `node --test tests/note-importer.test.mjs` and verify these tests fail before the new API exists.
- [x] Implement summary formatting and separate local-preview, commit, and push decisions; preserve imported files on every declined choice.
- [x] Document the new administrator flow.
- [x] Run `node --test tests/note-importer.test.mjs && npm run test`.
- [x] Commit with `feat: preview imports before publishing`.

### Task 3: Render knowledge, operations, and learning paths

**Files:** `site/.vitepress/theme/components/ArticleEnhancements.vue`, `site/.vitepress/theme/components/CoursePaths.vue`, `site/.vitepress/theme/Layout.vue`, `site/.vitepress/theme/index.ts`, `site/.vitepress/theme/components/{NoteList,RecentNotes,BrowseNotes}.vue`, `site/.vitepress/theme/custom.css`, `site/learning-paths/index.md`, `site/.vitepress/config.mts`, `tests/discovery-pages.test.mjs`

**Interfaces:** Article components consume generated `note-index.json`; the new `/learning-paths/` route lists public series.

- [x] Write a failing build assertion for the new page and visible article metadata/network markers.
- [x] Run `node --test tests/discovery-pages.test.mjs` and verify it fails because the route/component is absent.
- [x] Implement route-aware article enhancements, learning paths, featured/update card fields, and responsive styles.
- [x] Run `node --test tests/discovery-pages.test.mjs && npm run test && npm run docs:build`.
- [x] Commit with `feat: show note knowledge and learning paths`.

### Task 4: Add optional engagement and examples

**Files:** `site/.vitepress/theme/engagement.ts`, `site/.vitepress/theme/components/EngagementWidgets.vue`, `site/.vitepress/theme/Layout.vue`, `site/.vitepress/config.mts`, `site/.vitepress/theme/custom.css`, `templates/note.md`, `README.md`, `tests/site-config.test.mjs`

**Interfaces:** `engagement` has empty GoatCounter/Giscus values by default; widget injection is safe when disabled and uses only public IDs when enabled.

- [x] Write failing source/config tests for empty-safe engagement configuration and both integrations.
- [x] Run `node --test tests/site-config.test.mjs` and verify it fails because the module is absent.
- [x] Implement the configuration module, conditional script components, RSS/feedback footer links, metadata template, and setup documentation.
- [x] Run `node --test tests/site-config.test.mjs && npm run content:check && npm run docs:build`.
- [x] Commit with `feat: add optional reader engagement`.

### Task 5: Release verification

**Files:** `openspec/changes/enhance-note-publishing-network-growth/tasks.md`, `docs/superpowers/verification/2026-08-12-note-publishing-network-growth.md`

- [x] Run `openspec validate enhance-note-publishing-network-growth --strict`.
- [x] Run `npm run content:check && npm run test && npm run docs:build`.
- [x] Start `npm run docs:preview -- --host 127.0.0.1` and smoke-test homepage, article, learning path, RSS, and Sitemap.
- [x] Record results, complete OpenSpec checkboxes, and commit with `docs: verify note publishing enhancements`.
