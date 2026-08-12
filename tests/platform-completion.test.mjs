import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

const root = await mkdtemp(join(tmpdir(), 'gitpagewebnote-complete-'))
const siteDir = join(root, 'site')
await mkdir(join(siteDir, 'python'), { recursive: true })
await writeFile(join(siteDir, 'python', 'scheduled.md'), `---
title: Scheduled
category: python
tags: [Python]
date: 2026-08-12
publishAt: 2026-08-20
description: Scheduled article.
---

# Scheduled
`, 'utf8')
await writeFile(join(siteDir, 'python', 'live.md'), `---
title: Live
category: python
tags: [Python]
date: 2026-01-01
updated: 2026-01-01
description: Live article.
prerequisites: [Python 基础]
---

# Live
`, 'utf8')

test.after(async () => rm(root, { recursive: true, force: true }))

test('reports scheduled, stale, source-less, and isolated content health states', async () => {
  const { buildContentHealthReport } = await import('../scripts/content-index.mjs')
  const report = await buildContentHealthReport({ siteDir, now: '2026-08-12', staleAfterDays: 180 })
  assert.deepEqual(report.scheduled.map((item) => item.title), ['Scheduled'])
  assert.deepEqual(report.stale.map((item) => item.title), ['Live'])
  assert.deepEqual(report.withoutSources.map((item) => item.title), ['Live'])
  assert.deepEqual(report.isolated.map((item) => item.title), ['Live'])
})
