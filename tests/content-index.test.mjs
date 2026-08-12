import assert from 'node:assert/strict'
import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

const fixtureRoot = await mkdtemp(join(tmpdir(), 'gitpagewebnote-index-'))
const fixtureSite = join(fixtureRoot, 'site')

await mkdir(join(fixtureSite, 'langgraph'), { recursive: true })
await writeFile(
  join(fixtureSite, 'langgraph', 'state.md'),
  `---
title: State Graph
category: langgraph
tags: [LangGraph, Agent]
date: 2026-08-12
description: A durable workflow state.
---

# State Graph

This note contains enough words to measure a reading time.`,
  'utf8'
)
await writeFile(
  join(fixtureSite, 'langgraph', 'draft.md'),
  `---
title: Private draft
category: langgraph
tags: [LangGraph]
date: 2026-08-13
description: This must stay private.
draft: true
---

# Private draft`,
  'utf8'
)
await writeFile(
  join(fixtureSite, 'langgraph', 'broken.md'),
  `---
title: Broken note
category: langgraph
tags: [LangGraph]
date: 2026-08-11
---

# Broken note`,
  'utf8'
)

test.after(async () => rm(fixtureRoot, { recursive: true, force: true }))

test('indexes published notes while excluding drafts', async () => {
  const { loadNotes } = await import('../scripts/content-index.mjs')
  const notes = await loadNotes({ siteDir: fixtureSite })

  assert.deepEqual(notes.map((note) => note.title), ['State Graph', 'Broken note'])
  assert.equal(notes[0].url, '/langgraph/state')
  assert.equal(notes[0].readingMinutes, 1)
  assert.deepEqual(notes[0].tags, ['LangGraph', 'Agent'])
})

test('builds a category sidebar from valid published notes', async () => {
  const { buildSidebar, loadNotes } = await import('../scripts/content-index.mjs')
  const notes = await loadNotes({ siteDir: fixtureSite })
  const sidebar = buildSidebar(notes.filter((note) => note.title === 'State Graph'))

  assert.deepEqual(sidebar['/langgraph/'][0].items, [
    { text: 'State Graph', link: '/langgraph/state' }
  ])
})

test('reports required frontmatter errors with the file path', async () => {
  const { validateNotes } = await import('../scripts/content-index.mjs')
  const issues = await validateNotes({ siteDir: fixtureSite })

  assert.deepEqual(issues, [
    {
      file: 'langgraph/broken.md',
      message: 'Missing required frontmatter field: description'
    }
  ])
})

test('reports a broken relative Markdown link before publishing', async () => {
  const linkSite = join(fixtureRoot, 'link-site')
  await mkdir(join(linkSite, 'python'), { recursive: true })
  await writeFile(
    join(linkSite, 'python', 'broken-link.md'),
    `---
title: Broken link
category: python
tags: [Python]
date: 2026-08-12
description: A note with a broken link.
---

# Broken link

[Missing note](missing.md)`,
    'utf8'
  )

  const { validateNotes } = await import('../scripts/content-index.mjs')
  assert.deepEqual(await validateNotes({ siteDir: linkSite }), [
    {
      file: 'python/broken-link.md',
      message: 'Missing local Markdown link: missing.md'
    }
  ])
})
