import { readdir, readFile } from 'node:fs/promises'
import { basename, extname, resolve } from 'node:path'
import matter from 'gray-matter'
import { createImportPlan, recommendNoteMetadata, writeImport } from './note-importer.mjs'

const fallbackTags = { python: ['Python'], langchain: ['LangChain'], langgraph: ['LangGraph'], 'ai-coding': ['AI Coding'] }

async function discoverMarkdown(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const filePath = resolve(directory, entry.name)
    if (entry.isDirectory()) files.push(...await discoverMarkdown(filePath))
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) files.push(filePath)
  }
  return files.sort()
}

function firstParagraph(content) {
  return content.replace(/^#.+$/gm, '').split(/\n\s*\n/).map((part) => part.trim().replace(/\n+/g, ' ')).find((part) => part.length > 10) || '从本地收件箱自动导入的笔记。'
}

function asDate(value, fallback) {
  if (value instanceof Date && !Number.isNaN(value.valueOf())) return value.toISOString().slice(0, 10)
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : fallback
}

export function metadataFromInbox(markdown, sourcePath, { date, publish = false } = {}) {
  const parsed = matter(markdown)
  const recommendation = recommendNoteMetadata(markdown)
  const heading = parsed.content.match(/^#\s+(.+)$/m)?.[1]?.trim()
  const category = typeof parsed.data.category === 'string' ? parsed.data.category : recommendation.category
  const tags = Array.isArray(parsed.data.tags) && parsed.data.tags.length ? parsed.data.tags.map(String) : (recommendation.tags.length ? recommendation.tags : fallbackTags[category])
  return {
    title: typeof parsed.data.title === 'string' && parsed.data.title.trim() ? parsed.data.title.trim() : (heading || basename(sourcePath, extname(sourcePath))),
    category,
    tags,
    date: asDate(parsed.data.date, date),
    description: typeof parsed.data.description === 'string' && parsed.data.description.trim() ? parsed.data.description.trim() : firstParagraph(parsed.content),
    difficulty: typeof parsed.data.difficulty === 'string' ? parsed.data.difficulty : recommendation.difficulty,
    draft: publish ? false : true
  }
}

export async function importInbox({ inboxDir, siteDir, base = '/', date = new Date().toISOString().slice(0, 10), publish = false } = {}) {
  const files = await discoverMarkdown(resolve(inboxDir))
  const imported = []
  const skipped = []
  const failed = []
  const plans = []
  for (const sourcePath of files) {
    try {
      const source = await readFile(sourcePath, 'utf8')
      const metadata = metadataFromInbox(source, sourcePath, { date, publish })
      plans.push(await createImportPlan({ sourcePath, siteDir, metadata, base }))
    } catch (error) {
      const result = { sourcePath, message: error.message }
      if (/Target note already exists/.test(error.message)) skipped.push(result)
      else failed.push(result)
    }
  }
  if (failed.length) return { imported, skipped, failed }
  for (const plan of plans) {
    const result = await writeImport(plan)
    imported.push({ sourcePath: plan.sourcePath, targetPath: result.notePath, category: plan.metadata.category, tags: plan.metadata.tags, imageCount: result.assetPaths.length, draft: plan.metadata.draft })
  }
  return { imported, skipped, failed }
}
