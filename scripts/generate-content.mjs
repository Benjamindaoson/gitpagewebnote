import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { buildKnowledgeNetwork, groupNotes, loadNotes, validateNotes } from './content-index.mjs'

function asPublicNote(note) {
  return {
    title: note.title,
    category: note.category,
    tags: note.tags,
    date: note.date,
    description: note.description,
    difficulty: note.difficulty,
    updated: note.updated,
    featured: note.featured,
    changeLog: note.changeLog,
    series: note.series,
    seriesOrder: note.seriesOrder,
    wikiLinks: note.wikiLinks,
    backlinks: note.backlinks,
    relatedNotes: note.relatedNotes,
    seriesPrevious: note.seriesPrevious,
    seriesNext: note.seriesNext,
    url: note.url,
    sourcePath: note.sourcePath,
    readingMinutes: note.readingMinutes
  }
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function absoluteUrl(siteUrl, path) {
  return `${siteUrl.replace(/\/$/, '')}${path}`
}

function createFeed(notes, siteUrl) {
  const items = notes.map((note) => `
    <item>
      <title>${escapeXml(note.title)}</title>
      <link>${escapeXml(absoluteUrl(siteUrl, note.url))}</link>
      <guid>${escapeXml(absoluteUrl(siteUrl, note.url))}</guid>
      <description>${escapeXml(note.description)}</description>
      <pubDate>${new Date(`${note.updated}T00:00:00Z`).toUTCString()}</pubDate>
    </item>`).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Benjamin 的 AI 笔记</title>
    <link>${escapeXml(absoluteUrl(siteUrl, '/'))}</link>
    <description>AI、Python 与工程实践笔记</description>${items}
  </channel>
</rss>
`
}

function createSitemap(notes, siteUrl) {
  const staticPaths = ['/', '/updates/', '/categories/', '/tags/', '/archive/', '/learning-paths/']
  const urls = [
    ...staticPaths.map((path) => ({ path, date: '' })),
    ...notes.map((note) => ({ path: note.url, date: note.updated }))
  ]

  const entries = urls.map(({ path, date }) => `
  <url>
    <loc>${escapeXml(absoluteUrl(siteUrl, path))}</loc>${date ? `
    <lastmod>${date}</lastmod>` : ''}
  </url>`).join('')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}
</urlset>
`
}

export async function generateContent({
  siteDir = resolve('site'),
  outputFile = resolve(siteDir, '.vitepress/generated/note-index.json'),
  feedFile = resolve(siteDir, 'public/feed.xml'),
  sitemapFile = resolve(siteDir, 'public/sitemap.xml'),
  siteUrl = 'https://benjamindaoson.github.io/gitpagewebnote'
} = {}) {
  const issues = await validateNotes({ siteDir })
  if (issues.length > 0) {
    const details = issues.map((issue) => `${issue.file}: ${issue.message}`).join('\n')
    throw new Error(`Content validation failed:\n${details}`)
  }

  const network = buildKnowledgeNetwork(await loadNotes({ siteDir }))
  const notes = network.notes.map(asPublicNote)
  const index = { notes, ...groupNotes(notes), series: network.series }

  await mkdir(dirname(outputFile), { recursive: true })
  await writeFile(outputFile, `${JSON.stringify(index, null, 2)}\n`, 'utf8')
  await mkdir(dirname(feedFile), { recursive: true })
  await writeFile(feedFile, createFeed(notes, siteUrl), 'utf8')
  await mkdir(dirname(sitemapFile), { recursive: true })
  await writeFile(sitemapFile, createSitemap(notes, siteUrl), 'utf8')
  return index
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  generateContent()
    .then((index) => console.log(`Generated content index for ${index.notes.length} published notes.`))
    .catch((error) => {
      console.error(error.message)
      process.exitCode = 1
    })
}
