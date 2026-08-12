import assert from 'node:assert/strict'
import { access } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'
import test from 'node:test'

test('builds discovery pages and static subscription artifacts', async () => {
  const { generateContent } = await import('../scripts/generate-content.mjs')
  await generateContent()
  const result = spawnSync(process.execPath, ['node_modules/vitepress/bin/vitepress.js', 'build', 'site'], {
    cwd: process.cwd(),
    encoding: 'utf8'
  })

  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`)
  const output = join(process.cwd(), 'site', '.vitepress', 'dist')
  for (const file of [
    'updates/index.html',
    'categories/index.html',
    'tags/index.html',
    'archive/index.html',
    'feed.xml',
    'sitemap.xml'
  ]) {
    await assert.doesNotReject(access(join(output, file)), `Missing built artifact: ${file}`)
  }
})
