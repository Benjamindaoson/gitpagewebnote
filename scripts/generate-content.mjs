import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { buildKnowledgeNetwork, groupNotes, loadNotes, validateNotes } from './content-index.mjs'
import { loadPublishLog } from './publish-log.mjs'

function asPublicNote(note) {
  return {
    title: note.title,
    category: note.category,
    tags: note.tags,
    date: note.date,
    publishAt: note.publishAt,
    description: note.description,
    difficulty: note.difficulty,
    updated: note.updated,
    featured: note.featured,
    changeLog: note.changeLog,
    sources: note.sources,
    appliesTo: note.appliesTo,
    prerequisites: note.prerequisites,
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

function escapeSvg(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}

function wrapSvgText(value, maxLength = 18) {
  const text = String(value)
  return Array.from({ length: Math.ceil(text.length / maxLength) || 1 }, (_, index) => text.slice(index * maxLength, (index + 1) * maxLength))
}

function createSocialCard(note) {
  const title = wrapSvgText(note.title).map((line, index) => `<tspan x="96" dy="${index === 0 ? 0 : 76}">${escapeSvg(line)}</tspan>`).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#101827"/><circle cx="1080" cy="110" r="230" fill="#3b82f6" opacity=".35"/><rect x="76" y="76" width="210" height="44" rx="22" fill="#1d4ed8"/><text x="106" y="106" font-family="Arial, sans-serif" font-size="24" fill="white">${escapeSvg(note.category.toUpperCase())}</text><text x="96" y="240" font-family="Arial, sans-serif" font-size="62" font-weight="700" fill="white">${title}</text><text x="96" y="510" font-family="Arial, sans-serif" font-size="28" fill="#cbd5e1">${escapeSvg(note.description.slice(0, 58))}</text><text x="96" y="570" font-family="Arial, sans-serif" font-size="24" fill="#93c5fd">Benjamin 的 AI 笔记 · ${escapeSvg(note.updated)}</text></svg>`
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
  const staticPaths = ['/', '/updates/', '/categories/', '/tags/', '/archive/', '/learning-paths/', '/knowledge-map/', '/my-learning/', '/publish-log/']
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
  socialCardsDirectory = resolve(siteDir, 'public/social'),
  publishLogFile = resolve(siteDir, '.vitepress/generated/publish-log.json'),
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
  const publishLog = await loadPublishLog()

  await mkdir(dirname(outputFile), { recursive: true })
  await writeFile(outputFile, `${JSON.stringify(index, null, 2)}\n`, 'utf8')
  await mkdir(dirname(publishLogFile), { recursive: true })
  await writeFile(publishLogFile, `${JSON.stringify(publishLog, null, 2)}\n`, 'utf8')
  await mkdir(dirname(feedFile), { recursive: true })
  await writeFile(feedFile, createFeed(notes, siteUrl), 'utf8')
  await mkdir(dirname(sitemapFile), { recursive: true })
  await writeFile(sitemapFile, createSitemap(notes, siteUrl), 'utf8')
  await mkdir(socialCardsDirectory, { recursive: true })
  await Promise.all(notes.map((note) => writeFile(resolve(socialCardsDirectory, `${note.sourcePath.replace(/\//g, '--').replace(/\.md$/, '')}.svg`), createSocialCard(note), 'utf8')))
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
