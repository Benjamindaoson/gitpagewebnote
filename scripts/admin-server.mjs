import { createServer } from 'node:http'
import { execFile as execFileCallback, spawn } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { relative, resolve } from 'node:path'
import { randomBytes } from 'node:crypto'
import { pathToFileURL } from 'node:url'
import { promisify } from 'node:util'
import { performAdminImport } from './admin-workflow.mjs'
import { validateNotes } from './content-index.mjs'

const execFile = promisify(execFileCallback)
const rootDir = resolve('.')
const adminPage = resolve('admin/index.html')
const maxRequestBytes = 55 * 1024 * 1024

function respond(response, status, body, contentType = 'application/json; charset=utf-8') {
  response.writeHead(status, { 'content-type': contentType, 'cache-control': 'no-store' })
  response.end(typeof body === 'string' ? body : JSON.stringify(body))
}

async function readJson(request) {
  const chunks = []
  let size = 0
  for await (const chunk of request) {
    size += chunk.length
    if (size > maxRequestBytes) throw new Error('Request exceeds the 55 MB local admin limit')
    chunks.push(chunk)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

function decodeFiles(files) {
  if (!Array.isArray(files)) throw new Error('Choose a folder containing a Markdown file')
  return files.map((file) => ({ path: file.path, content: Buffer.from(String(file.base64 || ''), 'base64') }))
}

async function commitAndPush(paths, title) {
  const gitPaths = paths.map((path) => relative(rootDir, path))
  await execFile('git', ['add', '--', ...gitPaths], { cwd: rootDir })
  await execFile('git', ['commit', '-m', `docs: publish ${title}`], { cwd: rootDir })
  await execFile('git', ['push'], { cwd: rootDir })
}

export async function createAdminServer({ port = 4318, openBrowser = false } = {}) {
  const token = randomBytes(24).toString('hex')
  const pageTemplate = await readFile(adminPage, 'utf8')
  const server = createServer(async (request, response) => {
    try {
      if (request.method === 'GET' && request.url === '/') return respond(response, 200, pageTemplate.replace('__ADMIN_TOKEN__', token), 'text/html; charset=utf-8')
      if (request.method !== 'POST' || !['/api/preview', '/api/import'].includes(request.url || '')) return respond(response, 404, { error: 'Not found' })
      if (request.headers['x-admin-token'] !== token) return respond(response, 403, { error: 'Local admin token rejected' })
      const payload = await readJson(request)
      const metadata = { ...payload.metadata, draft: request.url === '/api/import' ? payload.mode !== 'publish' : payload.metadata?.draft !== false }
      const options = { rootDir, siteDir: resolve('site'), base: '/gitpagewebnote/', selectedPath: payload.selectedPath, files: decodeFiles(payload.files), metadata }
      if (request.url === '/api/preview') {
        const { prepareAdminImport } = await import('./admin-workflow.mjs')
        const prepared = await prepareAdminImport(options)
        try { return respond(response, 200, { summary: prepared.summary }) } finally { await prepared.cleanup() }
      }
      const imported = await performAdminImport(options)
      const issues = await validateNotes({ siteDir: resolve('site') })
      if (issues.length) return respond(response, 422, { error: 'Content validation failed', issues, imported })
      if (payload.mode === 'publish') await commitAndPush([imported.result.notePath, ...imported.result.assetPaths], imported.metadata.title)
      return respond(response, 200, { ...imported, published: payload.mode === 'publish' })
    } catch (error) {
      respond(response, 400, { error: error.message })
    }
  })
  await new Promise((resolvePromise) => server.listen(port, '127.0.0.1', resolvePromise))
  const address = server.address()
  const url = `http://127.0.0.1:${address.port}/`
  if (openBrowser) {
    const command = process.platform === 'win32' ? 'cmd' : process.platform === 'darwin' ? 'open' : 'xdg-open'
    const args = process.platform === 'win32' ? ['/c', 'start', '', url] : [url]
    spawn(command, args, { detached: true, stdio: 'ignore' }).unref()
  }
  return { server, url }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  createAdminServer({ openBrowser: true }).then(({ url }) => console.log(`本地笔记管理台已打开：${url}\n按 Ctrl+C 结束服务。`)).catch((error) => { console.error(error.message); process.exitCode = 1 })
}
