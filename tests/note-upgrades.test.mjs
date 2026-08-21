import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

const root = await mkdtemp(join(tmpdir(), 'gitpagewebnote-upgrades-'))
const siteDir = join(root, 'site')
await mkdir(join(siteDir, 'python'), { recursive: true })
await writeFile(join(siteDir, 'python', 'future.md'), `---
title: Future note
category: python
tags: [Python]
date: 2026-08-12
publishAt: 2026-08-20
description: A scheduled note.
sources:
  - title: Python docs
    url: https://docs.python.org/
    verified: 2026-08-12
appliesTo: Python 3.12
---

# Future note
`, 'utf8')
await writeFile(join(siteDir, 'python', 'live.md'), `---
title: Live note
category: python
tags: [Python, 工程实践]
date: 2026-01-01
updated: 2026-01-01
description: A live note.
---

# Live note
`, 'utf8')

test.after(async () => rm(root, { recursive: true, force: true }))

test('hides scheduled notes until publishAt and exposes source/version metadata after release', async () => {
  const { loadNotes } = await import('../scripts/content-index.mjs')
  assert.deepEqual((await loadNotes({ siteDir, now: '2026-08-19' })).map((note) => note.title), ['Live note'])
  const released = await loadNotes({ siteDir, now: '2026-08-20' })
  assert.equal(released[0].title, 'Future note')
  assert.equal(released[0].appliesTo, 'Python 3.12')
  assert.deepEqual(released[0].sources, [{ title: 'Python docs', url: 'https://docs.python.org/', verified: '2026-08-12' }])
})

test('finds stale notes and makes local import recommendations without sending note content away', async () => {
  const { findMaintenanceWarnings } = await import('../scripts/content-index.mjs')
  const { recommendNoteMetadata } = await import('../scripts/note-importer.mjs')
  const warnings = await findMaintenanceWarnings({ siteDir, now: '2026-08-12', staleAfterDays: 180 })
  const suggestion = recommendNoteMetadata('# LangGraph Agent\n\n```python\nfrom langgraph.graph import StateGraph\n```')

  assert.match(warnings[0].message, /超过 180 天未复核/)
  assert.equal(suggestion.category, 'langgraph')
  assert.ok(suggestion.tags.includes('LangGraph'))
  assert.equal(suggestion.difficulty, 'intermediate')
})

test('recommends the OpenClaw category for OpenClaw source-reading notes', async () => {
  const { recommendNoteMetadata } = await import('../scripts/note-importer.mjs')
  const suggestion = recommendNoteMetadata('# OpenClaw Runtime\n\n追踪 OpenClaw Gateway 与 Agent Runtime 的调用链。')

  assert.equal(suggestion.category, 'openclaw')
  assert.ok(suggestion.tags.includes('OpenClaw'))
})
