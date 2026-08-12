import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

const fixtureRoot = await mkdtemp(join(tmpdir(), 'gitpagewebnote-network-'))
const fixtureSite = join(fixtureRoot, 'site')

await mkdir(join(fixtureSite, 'langgraph'), { recursive: true })
await writeFile(join(fixtureSite, 'langgraph', 'target.md'), `---
title: Target note
category: langgraph
tags: [LangGraph, Agent]
date: 2026-08-01
updated: 2026-08-10
description: A target note.
series: LangGraph path
seriesOrder: 2
---

# Target note
`, 'utf8')
await writeFile(join(fixtureSite, 'langgraph', 'source.md'), `---
title: Source note
category: langgraph
tags: [LangGraph, Agent]
date: 2026-08-02
description: A source note.
featured: true
series: LangGraph path
seriesOrder: 1
changeLog:
  - date: 2026-08-11
    summary: Added examples.
---

# Source note

See [[Target note|the target]].
`, 'utf8')
await writeFile(join(fixtureSite, 'langgraph', 'related.md'), `---
title: Related note
category: langgraph
tags: [LangGraph]
date: 2026-08-03
description: A related note.
---

# Related note
`, 'utf8')
await writeFile(join(fixtureSite, 'langgraph', 'draft.md'), `---
title: Draft note
category: langgraph
tags: [LangGraph]
date: 2026-08-04
description: A private note.
draft: true
---

# Draft note
`, 'utf8')

test.after(async () => rm(fixtureRoot, { recursive: true, force: true }))

test('builds public wiki links, backlinks, related notes, and ordered series', async () => {
  const { buildKnowledgeNetwork, loadNotes } = await import('../scripts/content-index.mjs')
  const network = buildKnowledgeNetwork(await loadNotes({ siteDir: fixtureSite }))
  const source = network.notes.find((note) => note.title === 'Source note')
  const target = network.notes.find((note) => note.title === 'Target note')

  assert.equal(source.updated, '2026-08-02')
  assert.equal(source.featured, true)
  assert.deepEqual(source.changeLog, [{ date: '2026-08-11', summary: 'Added examples.' }])
  assert.deepEqual(source.wikiLinks, [{ title: 'Target note', label: 'the target', url: '/langgraph/target' }])
  assert.deepEqual(target.backlinks, [{ title: 'Source note', url: '/langgraph/source' }])
  assert.deepEqual(source.relatedNotes.map((note) => note.title), ['Related note'])
  assert.equal(source.seriesNext.title, 'Target note')
  assert.equal(target.seriesPrevious.title, 'Source note')
  assert.equal(network.series[0].title, 'LangGraph path')
  assert.deepEqual(network.series[0].notes.map((note) => note.title), ['Source note', 'Target note'])
  assert.equal(network.notes.some((note) => note.title === 'Draft note'), false)
})

test('rejects unknown, draft, and duplicate series wiki metadata', async () => {
  await writeFile(join(fixtureSite, 'langgraph', 'invalid.md'), `---
title: Invalid note
category: langgraph
tags: [LangGraph]
date: 2026-08-05
description: Invalid links.
series: LangGraph path
seriesOrder: 1
---

[[Missing note]] and [[Draft note]]
`, 'utf8')

  const { validateNotes } = await import('../scripts/content-index.mjs')
  const issues = await validateNotes({ siteDir: fixtureSite })

  assert.deepEqual(new Set(issues.map((issue) => issue.message)), new Set([
    'Unknown wiki link: Missing note',
    'Wiki link targets a draft note: Draft note',
    'Duplicate seriesOrder: LangGraph path #1'
  ]))
})
