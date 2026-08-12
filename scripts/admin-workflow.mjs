import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path'
import { tmpdir } from 'node:os'
import { createImportPlan, writeImport } from './note-importer.mjs'

const maxFiles = 100
const maxBytes = 50 * 1024 * 1024

export function normalizeUploadPath(value) {
  const path = String(value || '').replaceAll('\\', '/').replace(/^\.\//, '')
  if (!path || isAbsolute(path) || path.split('/').some((segment) => !segment || segment === '.' || segment === '..')) throw new Error(`Invalid upload path: ${value}`)
  return path
}

function isWithin(parentPath, childPath) {
  const path = relative(parentPath, childPath)
  return path === '' || (!path.startsWith(`..${sep}`) && path !== '..')
}

function toBuffer(content) {
  return Buffer.isBuffer(content) ? content : Buffer.from(String(content))
}

export async function prepareAdminImport({ rootDir = process.cwd(), siteDir = resolve('site'), base = '/', selectedPath, files, metadata } = {}) {
  if (!Array.isArray(files) || files.length === 0 || files.length > maxFiles) throw new Error(`Choose between 1 and ${maxFiles} files`)
  const workspace = await mkdtemp(resolve(tmpdir(), 'gitpagewebnote-admin-'))
  let byteCount = 0
  try {
    const normalizedSelectedPath = normalizeUploadPath(selectedPath)
    for (const file of files) {
      const normalizedPath = normalizeUploadPath(file.path)
      const targetPath = resolve(workspace, normalizedPath)
      if (!isWithin(workspace, targetPath)) throw new Error(`Invalid upload path: ${file.path}`)
      const content = toBuffer(file.content)
      byteCount += content.length
      if (byteCount > maxBytes) throw new Error('Upload exceeds the 50 MB local admin limit')
      await mkdir(dirname(targetPath), { recursive: true })
      await writeFile(targetPath, content)
    }
    const sourcePath = resolve(workspace, normalizedSelectedPath)
    if (!isWithin(workspace, sourcePath)) throw new Error(`Invalid upload path: ${selectedPath}`)
    const plan = await createImportPlan({ sourcePath, siteDir: resolve(siteDir), metadata, base })
    return {
      plan,
      summary: {
        targetNotePath: plan.targetNotePath,
        category: plan.metadata.category,
        tags: plan.metadata.tags,
        imageCount: plan.assetCopies.length,
        createdFiles: [plan.targetNotePath, ...plan.assetCopies.map((asset) => asset.targetPath)]
      },
      cleanup: async () => rm(workspace, { recursive: true, force: true })
    }
  } catch (error) {
    await rm(workspace, { recursive: true, force: true })
    throw error
  }
}

export async function performAdminImport(options) {
  const prepared = await prepareAdminImport(options)
  try {
    const result = await writeImport(prepared.plan)
    return { result, summary: prepared.summary, metadata: prepared.plan.metadata }
  } finally {
    await prepared.cleanup()
  }
}
