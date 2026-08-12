import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

const root = await mkdtemp(join(tmpdir(), 'gitpagewebnote-admin-'))
test.after(async () => rm(root, { recursive: true, force: true }))

test('previews a browser-selected Markdown folder without writing the site', async () => {
  const { prepareAdminImport } = await import('../scripts/admin-workflow.mjs')
  const prepared = await prepareAdminImport({
    rootDir: root,
    siteDir: join(root, 'site'),
    base: '/gitpagewebnote/',
    selectedPath: 'lesson/conditional-edge.md',
    files: [
      { path: 'lesson/conditional-edge.md', content: '# Conditional edge\n\nUse StateGraph.\n\n![Flow](assets/flow.png)' },
      { path: 'lesson/assets/flow.png', content: Buffer.from('image') }
    ],
    metadata: { title: 'Conditional edge', description: 'Use StateGraph conditional edges.', category: 'langgraph', tags: ['LangGraph'], difficulty: 'beginner', date: '2026-08-12', draft: true }
  })
  assert.equal(prepared.summary.category, 'langgraph')
  assert.equal(prepared.summary.imageCount, 1)
  assert.match(prepared.summary.targetNotePath, /site[\\/]langgraph[\\/]conditional-edge\.md$/)
  await prepared.cleanup()
})

test('rejects browser upload paths that escape the temporary workspace', async () => {
  const { normalizeUploadPath } = await import('../scripts/admin-workflow.mjs')
  assert.throws(() => normalizeUploadPath('../private.md'), /Invalid upload path/)
})

test('serves a token-protected local admin preview endpoint', async () => {
  const { createAdminServer } = await import('../scripts/admin-server.mjs')
  const { server, url } = await createAdminServer({ port: 0 })
  try {
    const page = await fetch(url)
    const html = await page.text()
    const token = html.match(/name="admin-token" content="([^"]+)"/)?.[1]
    assert.ok(token)
    const response = await fetch(`${url}api/preview`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-admin-token': token },
      body: JSON.stringify({
        selectedPath: 'admin-preview.md',
        files: [{ path: 'admin-preview.md', base64: Buffer.from('# Admin preview\n\nUse StateGraph.').toString('base64') }],
        metadata: { title: 'Admin preview', description: 'A local preview.', category: 'langgraph', tags: ['LangGraph'], difficulty: 'beginner', date: '2026-08-12' }
      })
    })
    const data = await response.json()
    assert.equal(response.status, 200)
    assert.equal(data.summary.imageCount, 0)
    assert.match(data.summary.targetNotePath, /admin-preview\.md$/)
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
})
