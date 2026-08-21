import { access, copyFile, mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { basename, dirname, extname, relative, resolve, sep } from 'node:path'
import matter from 'gray-matter'
import { CATEGORY_OPTIONS } from './content-index.mjs'

const supportedImageExtensions = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'])
const imagePattern = /!\[([^\]]*)\]\(([^)\s]+)(\s+[^)]*)?\)/g

export function recommendNoteMetadata(markdown) {
  const content = String(markdown).toLowerCase()
  const rules = [
    { category: 'openclaw', tag: 'OpenClaw', pattern: /openclaw/ },
    { category: 'langgraph', tag: 'LangGraph', pattern: /langgraph|stategraph/ },
    { category: 'langchain', tag: 'LangChain', pattern: /langchain|retriever|prompt template/ },
    { category: 'python', tag: 'Python', pattern: /python|pip|pytest|pandas/ },
    { category: 'ai-coding', tag: 'AI Coding', pattern: /cursor|copilot|ai coding|claude code/ }
  ]
  const matched = rules.filter((rule) => rule.pattern.test(content))
  const category = matched[0]?.category || 'ai-coding'
  const tags = [...new Set(matched.map((rule) => rule.tag).concat(/agent/.test(content) ? ['Agent'] : [], /rag|retriev/.test(content) ? ['RAG'] : []))]
  return { category, tags, difficulty: /```|\bapi\b|stategraph|async/.test(content) ? 'intermediate' : 'beginner' }
}

function isWithin(parentPath, childPath) {
  const relativePath = relative(parentPath, childPath)
  return relativePath === '' || (!relativePath.startsWith(`..${sep}`) && relativePath !== '..')
}

async function pathExists(path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

function normalizeBase(base) {
  return base.endsWith('/') ? base : `${base}/`
}

export function slugify(value) {
  const slug = value
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '')

  if (!slug) throw new Error('A title is required to create a note slug')
  return slug
}

function isExternalImage(imagePath) {
  return /^(https?:|data:|#|\/\/)/i.test(imagePath)
}

function validateMetadata(metadata) {
  const category = CATEGORY_OPTIONS.find((option) => option.value === metadata.category)
  if (!category) throw new Error(`Unknown category: ${metadata.category}`)
  if (!metadata.title?.trim()) throw new Error('A note title is required')
  if (!metadata.description?.trim()) throw new Error('A note description is required')
  if (!Array.isArray(metadata.tags) || metadata.tags.length === 0) throw new Error('At least one tag is required')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(metadata.date ?? '')) throw new Error('Date must use YYYY-MM-DD format')
}

export async function createImportPlan({ sourcePath, siteDir, metadata, base = '/' }) {
  validateMetadata(metadata)
  const resolvedSourcePath = resolve(sourcePath)
  if (extname(resolvedSourcePath).toLowerCase() !== '.md') {
    throw new Error('Only Markdown (.md) files can be imported')
  }

  const sourceStat = await stat(resolvedSourcePath)
  if (!sourceStat.isFile()) throw new Error(`Source Markdown is not a file: ${sourcePath}`)

  const sourceDirectory = dirname(resolvedSourcePath)
  const slug = slugify(metadata.slug ?? metadata.title)
  const targetNotePath = resolve(siteDir, metadata.category, `${slug}.md`)
  if (await pathExists(targetNotePath)) {
    throw new Error(`Target note already exists: ${targetNotePath}`)
  }

  const source = await readFile(resolvedSourcePath, 'utf8')
  const parsed = matter(source)
  const assetCopies = []
  const assetTargets = new Set()
  const rewrittenContent = parsed.content.replace(imagePattern, (fullMatch, alt, imagePath, suffix = '') => {
    if (isExternalImage(imagePath)) return fullMatch
    if (imagePath.startsWith('/')) return fullMatch

    const decodedImagePath = decodeURIComponent(imagePath)
    const resolvedImagePath = resolve(sourceDirectory, decodedImagePath)
    if (!isWithin(sourceDirectory, resolvedImagePath)) {
      throw new Error(`Image path escapes source directory: ${imagePath}`)
    }

    const extension = extname(resolvedImagePath).toLowerCase()
    if (!supportedImageExtensions.has(extension)) {
      throw new Error(`Unsupported local image type: ${imagePath}`)
    }

    const fileName = basename(resolvedImagePath)
    const targetPath = resolve(siteDir, 'public', 'notes', slug, fileName)
    if (assetTargets.has(targetPath)) {
      return `![${alt}](${normalizeBase(base)}notes/${slug}/${encodeURIComponent(fileName)}${suffix})`
    }

    assetTargets.add(targetPath)
    assetCopies.push({ sourcePath: resolvedImagePath, targetPath })
    return `![${alt}](${normalizeBase(base)}notes/${slug}/${encodeURIComponent(fileName)}${suffix})`
  })

  for (const assetCopy of assetCopies) {
    const imageStat = await stat(assetCopy.sourcePath)
    if (!imageStat.isFile()) throw new Error(`Local image is not a file: ${assetCopy.sourcePath}`)
    if (await pathExists(assetCopy.targetPath)) {
      throw new Error(`Target image already exists: ${assetCopy.targetPath}`)
    }
  }

  const frontmatter = {
    ...parsed.data,
    title: metadata.title.trim(),
    category: metadata.category,
    tags: metadata.tags.map(String),
    date: metadata.date,
    description: metadata.description.trim(),
    difficulty: metadata.difficulty ?? '',
    draft: metadata.draft === true
  }

  return {
    sourcePath: resolvedSourcePath,
    siteDir: resolve(siteDir),
    slug,
    metadata: frontmatter,
    targetNotePath,
    assetCopies,
    rewrittenMarkdown: matter.stringify(rewrittenContent.trimStart(), frontmatter)
  }
}

export async function writeImport(plan) {
  await mkdir(dirname(plan.targetNotePath), { recursive: true })
  for (const assetCopy of plan.assetCopies) {
    await mkdir(dirname(assetCopy.targetPath), { recursive: true })
  }

  for (const assetCopy of plan.assetCopies) {
    await copyFile(assetCopy.sourcePath, assetCopy.targetPath, 1)
  }
  await writeFile(plan.targetNotePath, plan.rewrittenMarkdown, 'utf8')

  return {
    notePath: plan.targetNotePath,
    assetPaths: plan.assetCopies.map((assetCopy) => assetCopy.targetPath)
  }
}
