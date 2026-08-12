import assert from 'node:assert/strict'
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

const root = await mkdtemp(join(tmpdir(), 'gitpagewebnote-inbox-'))
const inboxDir = join(root, 'note', 'inbox')
const siteDir = join(root, 'site')
await mkdir(join(inboxDir, 'assets'), { recursive: true })
await mkdir(siteDir, { recursive: true })
await writeFile(join(inboxDir, 'assets', 'branch.png'), 'image', 'utf8')
await writeFile(join(inboxDir, 'conditional-edge.md'), '# Conditional edge\n\nUse StateGraph conditional edges.\n\n![Branch](assets/branch.png)\n', 'utf8')
test.after(async () => rm(root, { recursive: true, force: true }))

test('imports every inbox note as a draft using local recommendations and keeps source files', async () => {
  const { importInbox } = await import('../scripts/inbox-importer.mjs')
  const result = await importInbox({ inboxDir, siteDir, date: '2026-08-12', base: '/gitpagewebnote/' })
  assert.equal(result.imported.length, 1)
  assert.equal(result.imported[0].category, 'langgraph')
  const imported = await readFile(join(siteDir, 'langgraph', 'conditional-edge.md'), 'utf8')
  assert.match(imported, /draft: true/)
  assert.match(imported, /\/gitpagewebnote\/notes\/conditional-edge\/branch.png/)
  assert.equal(await readFile(join(inboxDir, 'conditional-edge.md'), 'utf8'), '# Conditional edge\n\nUse StateGraph conditional edges.\n\n![Branch](assets/branch.png)\n')
})
