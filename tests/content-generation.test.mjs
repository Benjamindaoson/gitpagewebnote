import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import test from 'node:test'

const fixtureRoot = await mkdtemp(join(tmpdir(), 'gitpagewebnote-generate-'))
const fixtureSite = join(fixtureRoot, 'site')
const outputFile = join(fixtureRoot, 'note-index.json')

await mkdir(join(fixtureSite, 'python'), { recursive: true })
await writeFile(
  join(fixtureSite, 'python', 'tips.md'),
  `---
title: Python tips
category: python
tags: [Python]
date: 2026-08-10
description: Practical Python tips.
---

# Python tips

Useful tips.`,
  'utf8'
)
await writeFile(
  join(fixtureSite, 'python', 'draft.md'),
  `---
title: Hidden draft
category: python
tags: [Python]
date: 2026-08-11
description: A draft.
draft: true
---

# Hidden draft`,
  'utf8'
)

test.after(async () => rm(fixtureRoot, { recursive: true, force: true }))

test('generates a public index containing published note discovery data only', async () => {
  const { generateContent } = await import('../scripts/generate-content.mjs')
  await generateContent({ siteDir: fixtureSite, outputFile })
  const index = JSON.parse(await readFile(outputFile, 'utf8'))

  assert.equal(index.notes.length, 1)
  assert.equal(index.notes[0].title, 'Python tips')
  assert.equal(index.notes[0].updated, '2026-08-10')
  assert.equal(index.notes[0].featured, false)
  assert.deepEqual(index.notes[0].wikiLinks, [])
  assert.equal(index.categories[0].label, 'Python')
  assert.equal(index.tags[0].tag, 'Python')
  assert.equal(index.years[0].year, '2026')
  const feed = await readFile(join(fixtureSite, 'public', 'feed.xml'), 'utf8')
  const sitemap = await readFile(join(fixtureSite, 'public', 'sitemap.xml'), 'utf8')
  assert.match(feed, /<link>https:\/\/benjamindaoson\.github\.io\/gitpagewebnote\/python\/tips<\/link>/)
  assert.match(sitemap, /https:\/\/benjamindaoson\.github\.io\/gitpagewebnote\/python\/tips/)
})

test('runs as a CLI and writes the default generated index path', async () => {
  const scriptPath = join(process.cwd(), 'scripts', 'generate-content.mjs')
  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: fixtureRoot,
    encoding: 'utf8'
  })

  assert.equal(result.status, 0, result.stderr)
  const index = JSON.parse(await readFile(join(fixtureSite, '.vitepress', 'generated', 'note-index.json'), 'utf8'))
  assert.equal(index.notes[0].title, 'Python tips')
})

test('serializes knowledge-network fields and uses the update date in feeds', async () => {
  await writeFile(join(fixtureSite, 'python', 'updated.md'), `---
title: Updated Python note
category: python
tags: [Python]
date: 2026-08-09
updated: 2026-08-12
description: An updated note.
featured: true
---

# Updated Python note

[[Python tips]]
`, 'utf8')

  const { generateContent } = await import('../scripts/generate-content.mjs')
  const index = await generateContent({ siteDir: fixtureSite, outputFile })
  const updated = index.notes.find((note) => note.title === 'Updated Python note')
  const feed = await readFile(join(fixtureSite, 'public', 'feed.xml'), 'utf8')
  const sitemap = await readFile(join(fixtureSite, 'public', 'sitemap.xml'), 'utf8')

  assert.equal(updated.featured, true)
  assert.deepEqual(updated.wikiLinks, [{ title: 'Python tips', label: 'Python tips', url: '/python/tips' }])
  assert.deepEqual(index.series, [])
  assert.match(feed, /Wed, 12 Aug 2026 00:00:00 GMT/)
  assert.match(sitemap, /<lastmod>2026-08-12<\/lastmod>/)
})
