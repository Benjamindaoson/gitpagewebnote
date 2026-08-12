import { readdir, readFile, stat } from 'node:fs/promises'
import { relative, resolve, sep } from 'node:path'
import matter from 'gray-matter'

export const CATEGORY_OPTIONS = [
  { value: 'python', label: 'Python' },
  { value: 'langchain', label: 'LangChain' },
  { value: 'langgraph', label: 'LangGraph' },
  { value: 'ai-coding', label: 'AI Coding' }
]

const categoryLabels = new Map(CATEGORY_OPTIONS.map((option) => [option.value, option.label]))
const requiredFields = ['title', 'category', 'tags', 'date', 'description']
const markdownImagePattern = /!\[[^\]]*\]\(([^)\s]+)(?:\s+[^)]*)?\)/g
const markdownLinkPattern = /(?<!!)\[[^\]]*\]\(([^)\s]+)(?:\s+[^)]*)?\)/g
const wikiLinkPattern = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g

async function walkMarkdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    if (entry.name === '.vitepress' || entry.name === 'public') continue

    const entryPath = resolve(directory, entry.name)
    if (entry.isDirectory()) {
      files.push(...await walkMarkdownFiles(entryPath))
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(entryPath)
    }
  }

  return files
}

function normalizeDate(value) {
  if (value instanceof Date && !Number.isNaN(value.valueOf())) {
    return value.toISOString().slice(0, 10)
  }

  return typeof value === 'string' ? value : ''
}

function routeFromRelativePath(relativePath) {
  return `/${relativePath.replace(/\\/g, '/').replace(/\.md$/, '').replace(/\/index$/, '/')}`.replace(/\/+/g, '/')
}

function calculateReadingMinutes(content) {
  const words = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[#>*_`\[\]()]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  return Math.max(1, Math.ceil(words.length / 200))
}

function isNoteCandidate(relativePath) {
  return !relativePath.endsWith('/index.md') && relativePath !== 'index.md'
}

function asArray(value) {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : []
}

function asChangeLog(value) {
  if (!Array.isArray(value)) return []
  return value
    .filter((entry) => entry && typeof entry === 'object')
    .map((entry) => ({ date: normalizeDate(entry.date), summary: typeof entry.summary === 'string' ? entry.summary.trim() : '' }))
    .filter((entry) => entry.date && entry.summary)
}

function getWikiLinks(content) {
  return [...content.matchAll(wikiLinkPattern)].map((match) => ({
    title: match[1].trim(),
    label: (match[2] || match[1]).trim()
  })).filter((link) => link.title)
}

function isWithin(parentPath, childPath) {
  const relativePath = relative(parentPath, childPath)
  return relativePath === '' || (!relativePath.startsWith(`..${sep}`) && relativePath !== '..')
}

async function isFile(path) {
  try {
    return (await stat(path)).isFile()
  } catch {
    return false
  }
}

async function loadAllNotes({ siteDir }) {
  const markdownFiles = await walkMarkdownFiles(siteDir)
  const notes = []

  for (const filePath of markdownFiles) {
    const sourcePath = relative(siteDir, filePath).replace(/\\/g, '/')
    if (!isNoteCandidate(sourcePath)) continue

    const source = await readFile(filePath, 'utf8')
    const parsed = matter(source)
    notes.push({
      title: typeof parsed.data.title === 'string' ? parsed.data.title : '',
      category: typeof parsed.data.category === 'string' ? parsed.data.category : '',
      tags: asArray(parsed.data.tags),
      date: normalizeDate(parsed.data.date),
      description: typeof parsed.data.description === 'string' ? parsed.data.description : '',
      difficulty: typeof parsed.data.difficulty === 'string' ? parsed.data.difficulty : '',
      updated: normalizeDate(parsed.data.updated) || normalizeDate(parsed.data.date),
      featured: parsed.data.featured === true,
      changeLog: asChangeLog(parsed.data.changeLog),
      series: typeof parsed.data.series === 'string' ? parsed.data.series.trim() : '',
      seriesOrder: Number.isInteger(parsed.data.seriesOrder) ? parsed.data.seriesOrder : null,
      draft: parsed.data.draft === true,
      url: routeFromRelativePath(sourcePath),
      sourcePath,
      filePath,
      content: parsed.content,
      readingMinutes: calculateReadingMinutes(parsed.content),
      wikiLinkTargets: getWikiLinks(parsed.content)
    })
  }

  return notes.sort((left, right) => Number(right.featured) - Number(left.featured) || right.updated.localeCompare(left.updated) || left.title.localeCompare(right.title, 'zh-CN'))
}

export async function loadNotes({ siteDir }) {
  return (await loadAllNotes({ siteDir })).filter((note) => !note.draft)
}

function asReference(note) {
  return { title: note.title, url: note.url }
}

export function buildKnowledgeNetwork(notes) {
  const byTitle = new Map(notes.map((note) => [note.title, note]))
  const enriched = notes.map((note) => ({
    ...note,
    wikiLinks: note.wikiLinkTargets.map((link) => ({ ...link, url: byTitle.get(link.title)?.url || '' })).filter((link) => link.url),
    backlinks: [],
    relatedNotes: [],
    seriesPrevious: null,
    seriesNext: null
  }))
  const enrichedByUrl = new Map(enriched.map((note) => [note.url, note]))

  for (const note of enriched) {
    for (const link of note.wikiLinks) {
      enrichedByUrl.get(link.url)?.backlinks.push(asReference(note))
    }
  }

  for (const note of enriched) {
    note.backlinks.sort((left, right) => left.title.localeCompare(right.title, 'zh-CN'))
    note.relatedNotes = enriched
      .filter((candidate) => candidate.url !== note.url && (!note.series || note.series !== candidate.series))
      .map((candidate) => ({ note: candidate, sharedTags: candidate.tags.filter((tag) => note.tags.includes(tag)).length }))
      .filter(({ sharedTags }) => sharedTags > 0)
      .sort((left, right) => right.sharedTags - left.sharedTags || right.note.updated.localeCompare(left.note.updated) || left.note.title.localeCompare(right.note.title, 'zh-CN'))
      .slice(0, 3)
      .map(({ note: candidate }) => asReference(candidate))
  }

  const series = [...new Map(enriched.filter((note) => note.series).map((note) => [note.series, []])).entries()]
    .map(([title, seriesNotes]) => {
      for (const note of enriched.filter((candidate) => candidate.series === title)) seriesNotes.push(note)
      seriesNotes.sort((left, right) => left.seriesOrder - right.seriesOrder || left.title.localeCompare(right.title, 'zh-CN'))
      seriesNotes.forEach((note, index) => {
        note.seriesPrevious = index > 0 ? asReference(seriesNotes[index - 1]) : null
        note.seriesNext = index < seriesNotes.length - 1 ? asReference(seriesNotes[index + 1]) : null
      })
      return { title, notes: seriesNotes.map(asReference) }
    })
    .sort((left, right) => left.title.localeCompare(right.title, 'zh-CN'))

  return { notes: enriched, series }
}

export function buildSidebar(notes) {
  return Object.fromEntries(CATEGORY_OPTIONS.map(({ value, label }) => {
    const items = notes
      .filter((note) => note.category === value)
      .map((note) => ({ text: note.title, link: note.url }))

    return [`/${value}/`, [{ text: label, items }]]
  }))
}

export async function validateNotes({ siteDir }) {
  const allNotes = await loadAllNotes({ siteDir })
  const notes = allNotes.filter((note) => !note.draft)
  const issues = []
  const routes = new Map()
  const titles = new Map()

  for (const note of allNotes) {
    const matchingNotes = titles.get(note.title) ?? []
    matchingNotes.push(note)
    titles.set(note.title, matchingNotes)
  }

  for (const note of notes) {
    for (const field of requiredFields) {
      const value = note[field]
      if ((Array.isArray(value) && value.length === 0) || (!Array.isArray(value) && !String(value).trim())) {
        issues.push({ file: note.sourcePath, message: `Missing required frontmatter field: ${field}` })
      }
    }

    if (note.category && !categoryLabels.has(note.category)) {
      issues.push({ file: note.sourcePath, message: `Unknown category: ${note.category}` })
    }

    if (note.date && !/^\d{4}-\d{2}-\d{2}$/.test(note.date)) {
      issues.push({ file: note.sourcePath, message: 'Date must use YYYY-MM-DD format' })
    }

    if (note.updated && !/^\d{4}-\d{2}-\d{2}$/.test(note.updated)) {
      issues.push({ file: note.sourcePath, message: 'Updated date must use YYYY-MM-DD format' })
    }

    if (note.series && (!Number.isInteger(note.seriesOrder) || note.seriesOrder < 1)) {
      issues.push({ file: note.sourcePath, message: 'Series requires a positive integer seriesOrder' })
    }

    if (!note.series && note.seriesOrder !== null) {
      issues.push({ file: note.sourcePath, message: 'seriesOrder requires a series name' })
    }

    for (const link of note.wikiLinkTargets) {
      const targets = titles.get(link.title) ?? []
      if (targets.length === 0) {
        issues.push({ file: note.sourcePath, message: `Unknown wiki link: ${link.title}` })
      } else if (targets.length > 1) {
        issues.push({ file: note.sourcePath, message: `Ambiguous wiki link: ${link.title}` })
      } else if (targets[0].draft) {
        issues.push({ file: note.sourcePath, message: `Wiki link targets a draft note: ${link.title}` })
      }
    }

    if (routes.has(note.url)) {
      issues.push({ file: note.sourcePath, message: `Duplicate note route: ${note.url}` })
    } else {
      routes.set(note.url, note.sourcePath)
    }

    const noteDirectory = resolve(note.filePath, '..')
    for (const match of note.content.matchAll(markdownImagePattern)) {
      const imagePath = match[1]
      if (/^(https?:|data:|#)/i.test(imagePath) || imagePath.startsWith('/')) continue

      const resolvedImage = resolve(noteDirectory, imagePath)
      if (!isWithin(siteDir, resolvedImage)) {
        issues.push({ file: note.sourcePath, message: `Image path escapes site directory: ${imagePath}` })
        continue
      }

      try {
        const imageStat = await stat(resolvedImage)
        if (!imageStat.isFile()) throw new Error('not a file')
      } catch {
        issues.push({ file: note.sourcePath, message: `Missing local image: ${imagePath}` })
      }
    }

    for (const match of note.content.matchAll(markdownLinkPattern)) {
      const linkPath = match[1]
      if (/^(https?:|mailto:|data:|#|\/\/)/i.test(linkPath) || linkPath.startsWith('/')) continue

      const normalizedLink = decodeURIComponent(linkPath).split(/[?#]/, 1)[0]
      if (!normalizedLink) continue
      const resolvedLink = resolve(noteDirectory, normalizedLink)
      if (!isWithin(siteDir, resolvedLink)) {
        issues.push({ file: note.sourcePath, message: `Markdown link escapes site directory: ${linkPath}` })
        continue
      }

      const candidates = normalizedLink.endsWith('.md')
        ? [resolvedLink]
        : [resolvedLink, `${resolvedLink}.md`, resolve(resolvedLink, 'index.md')]
      if (!(await Promise.all(candidates.map(isFile))).some(Boolean)) {
        issues.push({ file: note.sourcePath, message: `Missing local Markdown link: ${linkPath}` })
      }
    }
  }

  const seriesOrders = new Map()
  for (const note of notes.filter((note) => note.series && Number.isInteger(note.seriesOrder))) {
    const key = `${note.series}\u0000${note.seriesOrder}`
    const existing = seriesOrders.get(key)
    if (existing) {
      issues.push({ file: note.sourcePath, message: `Duplicate seriesOrder: ${note.series} #${note.seriesOrder}` })
    } else {
      seriesOrders.set(key, note)
    }
  }

  return issues.sort((left, right) => left.file.localeCompare(right.file) || left.message.localeCompare(right.message))
}

export function groupNotes(notes) {
  const byCategory = Object.fromEntries(CATEGORY_OPTIONS.map(({ value }) => [value, []]))
  const byTag = new Map()
  const byYear = new Map()

  for (const note of notes) {
    if (byCategory[note.category]) byCategory[note.category].push(note)
    for (const tag of note.tags) {
      const taggedNotes = byTag.get(tag) ?? []
      taggedNotes.push(note)
      byTag.set(tag, taggedNotes)
    }
    const year = note.date.slice(0, 4)
    const yearlyNotes = byYear.get(year) ?? []
    yearlyNotes.push(note)
    byYear.set(year, yearlyNotes)
  }

  return {
    categories: CATEGORY_OPTIONS.map(({ value, label }) => ({ value, label, notes: byCategory[value] })),
    tags: [...byTag.entries()].sort(([left], [right]) => left.localeCompare(right, 'zh-CN')).map(([tag, taggedNotes]) => ({ tag, notes: taggedNotes })),
    years: [...byYear.entries()].sort(([left], [right]) => right.localeCompare(left)).map(([year, yearlyNotes]) => ({ year, notes: yearlyNotes }))
  }
}
