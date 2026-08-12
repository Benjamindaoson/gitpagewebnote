# Site Quality Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve the audited scaling, SEO, accessibility, documentation, and supply-chain gaps while keeping the site static.

**Architecture:** Add two pure modules for metadata and map geometry so behaviour is testable independently of VitePress/Vue. The VitePress configuration and map component consume those modules; security configuration remains declarative in GitHub Actions and `.gitignore`.

**Tech Stack:** Node.js ESM tests, VitePress, Vue 3, GitHub Actions.

## Task 1: SEO resolver

**Files:** `tests/site-hardening.test.mjs`, `scripts/site-seo.mjs`, `site/.vitepress/config.mts`

- [ ] Write a failing test for absolute complete Open Graph/Twitter metadata.
- [ ] Run `npm test -- --test-name-pattern "Open Graph"` and verify the missing module failure.
- [ ] Implement `createSeoHead` and integrate it for notes and generated pages.
- [ ] Re-run the focused test.

## Task 2: Knowledge map geometry

**Files:** `tests/site-hardening.test.mjs`, `scripts/knowledge-map-layout.mjs`, `site/.vitepress/theme/components/KnowledgeMap.vue`, `site/.vitepress/theme/custom.css`

- [ ] Write a failing test for a 13-node dynamic layout and URL index.
- [ ] Run `npm test -- --test-name-pattern "knowledge-map nodes"` and verify the missing module failure.
- [ ] Implement dynamic geometry, filter controls, keyboard names, hover/focus neighbor highlights, and a text fallback.
- [ ] Re-run the focused test.

## Task 3: Content and supply-chain hygiene

**Files:** `site/index.md`, `site/.vitepress/config.mts`, `.github/workflows/*.yml`, `.gitignore`

- [ ] Correct automated-sidebar copy and LangGraph navigation.
- [ ] Pin actions by full immutable SHA and add secret/private-file ignores.
- [ ] Run full validation and build.
