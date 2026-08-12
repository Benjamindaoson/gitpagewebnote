import assert from 'node:assert/strict'
import { access, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

const fixtureRoot = await mkdtemp(join(tmpdir(), 'gitpagewebnote-import-'))
const sourceDir = join(fixtureRoot, 'incoming')
const siteDir = join(fixtureRoot, 'site')
const sourcePath = join(sourceDir, 'state diagram.md')

await mkdir(join(sourceDir, 'assets'), { recursive: true })
await mkdir(join(siteDir, 'langgraph'), { recursive: true })
await writeFile(join(sourceDir, 'assets', 'diagram.png'), 'image-bytes', 'utf8')
await writeFile(sourcePath, '# State diagram\n\n![Diagram](assets/diagram.png)\n', 'utf8')

const metadata = {
  title: 'State diagram',
  category: 'langgraph',
  tags: ['LangGraph', 'Agent'],
  date: '2026-08-12',
  description: 'A graph with explicit state.',
  difficulty: 'beginner'
}

test.after(async () => rm(fixtureRoot, { recursive: true, force: true }))

test('imports Markdown and copies same-directory images to public note assets', async () => {
  const { createImportPlan, writeImport } = await import('../scripts/note-importer.mjs')
  const plan = await createImportPlan({ sourcePath, siteDir, metadata, base: '/gitpagewebnote/' })

  assert.equal(plan.targetNotePath, join(siteDir, 'langgraph', 'state-diagram.md'))
  assert.equal(plan.assetCopies[0].targetPath, join(siteDir, 'public', 'notes', 'state-diagram', 'diagram.png'))
  assert.match(plan.rewrittenMarkdown, /!\[Diagram\]\(\/gitpagewebnote\/notes\/state-diagram\/diagram.png\)/)

  await writeImport(plan)
  assert.match(await readFile(plan.targetNotePath, 'utf8'), /category: langgraph/)
  assert.equal(await readFile(plan.assetCopies[0].targetPath, 'utf8'), 'image-bytes')
})

test('rejects an image path that escapes the source Markdown directory', async () => {
  const { createImportPlan } = await import('../scripts/note-importer.mjs')
  const unsafePath = join(sourceDir, 'unsafe.md')
  await writeFile(unsafePath, '# Unsafe\n\n![Private](../private.png)\n', 'utf8')

  await assert.rejects(
    createImportPlan({
      sourcePath: unsafePath,
      siteDir,
      metadata: { ...metadata, title: 'Unsafe note' },
      base: '/gitpagewebnote/'
    }),
    /Image path escapes source directory: \..\/private\.png/
  )
})

test('rejects a conflicting target note without overwriting it', async () => {
  const { createImportPlan } = await import('../scripts/note-importer.mjs')
  const conflictMetadata = { ...metadata, title: 'Conflict note' }
  const conflictPath = join(siteDir, 'langgraph', 'conflict-note.md')
  await writeFile(conflictPath, 'existing content', 'utf8')

  await assert.rejects(
    createImportPlan({ sourcePath, siteDir, metadata: conflictMetadata, base: '/gitpagewebnote/' }),
    /Target note already exists: /
  )
  assert.equal(await readFile(conflictPath, 'utf8'), 'existing content')
  await access(join(sourceDir, 'assets', 'diagram.png'))
  await rm(conflictPath)
})

test('imports through the choice-driven CLI without asking for custom text', async () => {
  const cliSource = join(sourceDir, 'cli note.md')
  await writeFile(cliSource, '# CLI note\n\nA concise imported note.\n\n![Diagram](assets/diagram.png)\n', 'utf8')
  const answers = ['1', '1', '3', '3,4', '1', '1', '1', '1']
  const reader = {
    question: async () => answers.shift(),
    close: () => undefined
  }
  const { runInteractiveImport } = await import('../scripts/import-note.mjs')

  await runInteractiveImport(cliSource, { reader, siteDir })
  const importedPath = join(siteDir, 'langgraph', 'cli-note.md')
  await assert.doesNotReject(access(importedPath))
  assert.match(await readFile(importedPath, 'utf8'), /title: CLI note/)
  assert.equal(await readFile(join(siteDir, 'public', 'notes', 'cli-note', 'diagram.png'), 'utf8'), 'image-bytes')
})
