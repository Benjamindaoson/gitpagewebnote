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

export async function loadNotes({ siteDir }) {
  const markdownFiles = await walkMarkdownFiles(siteDir)
  const notes = []

  for (const filePath of markdownFiles) {
    const sourcePath = relative(siteDir, filePath).replace(/\\/g, '/')
    if (!isNoteCandidate(sourcePath)) continue

    const source = await readFile(filePath, 'utf8')
    const parsed = matter(source)
    if (parsed.data.draft === true) continue

    notes.push({
      title: typeof parsed.data.title === 'string' ? parsed.data.title : '',
      category: typeof parsed.data.category === 'string' ? parsed.data.category : '',
      tags: asArray(parsed.data.tags),
      date: normalizeDate(parsed.data.date),
      description: typeof parsed.data.description === 'string' ? parsed.data.description : '',
      difficulty: typeof parsed.data.difficulty === 'string' ? parsed.data.difficulty : '',
      draft: false,
      url: routeFromRelativePath(sourcePath),
      sourcePath,
      filePath,
      content: parsed.content,
      readingMinutes: calculateReadingMinutes(parsed.content)
    })
  }

  return notes.sort((left, right) => right.date.localeCompare(left.date) || left.title.localeCompare(right.title, 'zh-CN'))
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
  const notes = await loadNotes({ siteDir })
  const issues = []
  const routes = new Map()

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
