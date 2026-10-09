import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { deflateRawSync } from 'node:zlib'
import matter from 'gray-matter'
import { books } from './book-catalog.mjs'

const ORIGIN = 'https://benjamindaoson.github.io/gitpagewebnote'
const escape = (v) => String(v).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
const header = '<?xml version="1.0" encoding="UTF-8"?>\n'
const start = '<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="zh-CN"><head><meta charset="UTF-8"/>'
const stylesheet = 'body{font-family:serif;line-height:1.7;color:#273d31}h1,h2,h3{font-family:sans-serif}p,li{overflow-wrap:break-word}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#f0f2e9;padding:.7em;font-size:.85em}blockquote{padding-left:.8em;border-left:3px solid #9cb4a5}.kicker,.subtle{color:#5c7265;font-size:.8em}a{color:#235f43}'
function targetLink(link, book) {
  const raw = link.trim().replace(/\.md$/, '')
  if (/^https?:\/\//.test(raw) || /^mailto:/.test(raw) || raw.startsWith('#')) return raw
  const index = book.chapters.findIndex((ch) => ch.href.replace(/\/$/, '') === raw.replace(/\/$/, ''))
  if (index >= 0) return 'chapter-' + (index + 1) + '.xhtml'
  return ORIGIN + (raw.startsWith('/') ? raw : '/' + raw.replace(/^\.\//, ''))
}
function inline(source, book, titles) {
  return escape(source)
    .replace(/\[\[([^\]]+)\]\]/g, (_all, body) => {
      const [title, label] = body.split('|', 2)
      const index = titles.indexOf(title.trim())
      return index >= 0 ? '<a href="chapter-' + (index + 1) + '.xhtml">' + (label || title).trim() + '</a>' : (label || title).trim()
    })
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_all, label, link) => '<a href="' + escape(targetLink(link, book)) + '">' + label + '</a>')
    .replace(/\x60([^\x60]+)\x60/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
}
function markdownToHtml(source, book, titles) {
  const lines = source.replace(/\r\n/g, '\n').split('\n')
  const out = []
  const fence = (s) => /^\s*\x60{3}/.test(s)
  const heading = (s) => /^\s*#{1,6}\s/.test(s)
  const list = (s) => /^\s*(?:[-*]|\d+\.)\s/.test(s)
  const block = (s) => heading(s) || list(s) || fence(s) || /^\s*>/.test(s)
  let i = 0, skipped = false
  while (i < lines.length) {
    const line = lines[i]
    if (!line.trim()) { i++; continue }
    if (fence(line)) {
      const buffer = []; i++
      while (i < lines.length && !fence(lines[i])) buffer.push(lines[i++])
      i++; out.push('<pre><code>' + escape(buffer.join('\n')) + '</code></pre>'); continue
    }
    if (heading(line)) {
      const found = line.match(/^\s*(#{1,6})\s+(.*)$/)
      i++
      if (found[1].length === 1 && !skipped) { skipped = true; continue }
      const level = Math.max(2, found[1].length)
      out.push('<h' + level + '>' + inline(found[2], book, titles) + '</h' + level + '>'); continue
    }
    if (list(line)) {
      const ordered = /^\s*\d+\.\s/.test(line), tag = ordered ? 'ol' : 'ul', entries = []
      while (i < lines.length && list(lines[i]) && /^\s*\d+\.\s/.test(lines[i]) === ordered) {
        entries.push('<li>' + inline(lines[i++].replace(/^\s*(?:[-*]|\d+\.)\s+/, ''), book, titles) + '</li>')
      }
      out.push('<' + tag + '>' + entries.join('') + '</' + tag + '>'); continue
    }
    if (/^\s*>/.test(line)) {
      const entries = []
      while (i < lines.length && /^\s*>/.test(lines[i])) entries.push(lines[i++].replace(/^\s*>\s?/, ''))
      out.push('<blockquote><p>' + inline(entries.join(' '), book, titles) + '</p></blockquote>'); continue
    }
    const parts = [line]; i++
    while (i < lines.length && lines[i].trim() && !block(lines[i])) parts.push(lines[i++])
    out.push('<p>' + inline(parts.join(' '), book, titles) + '</p>')
  }
  return out.join('\n')
}
function metadata(book, documents) {
  const updated = documents.map((doc) => String(doc.data.updated || doc.data.date).slice(0, 10)).sort().at(-1)
  const manifest = book.chapters.map((_ch, i) => '<item id="ch' + i + '" href="chapter-' + (i + 1) + '.xhtml" media-type="application/xhtml+xml"/>').join('')
  const spine = book.chapters.map((_ch, i) => '<itemref idref="ch' + i + '"/>').join('')
  return header + '<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="id" xml:lang="zh-CN"><metadata xmlns:dc="http://purl.org/dc/elements/1.1/"><dc:identifier id="id">urn:benjamintaoson:' + book.id + '</dc:identifier><dc:title>' + escape(book.title) + '</dc:title><dc:creator>Benjamin Taoson</dc:creator><dc:language>zh-CN</dc:language><dc:description>' + escape(book.summary) + '</dc:description><meta property="dcterms:modified">' + updated + 'T00:00:00Z</meta></metadata><manifest><item id="toc" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/><item id="title" href="title.xhtml" media-type="application/xhtml+xml"/><item id="css" href="book.css" media-type="text/css"/>' + manifest + '</manifest><spine><itemref idref="title"/>' + spine + '</spine></package>'
}
function createFiles(book, docs) {
  const titles = docs.map((doc) => String(doc.data.title || '').trim())
  const toc = book.chapters.map((ch, i) => '<li><a href="chapter-' + (i + 1) + '.xhtml">' + escape((i + 1) + '. ' + ch.title) + '</a></li>').join('')
  const nav = header + '<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="zh-CN"><head><meta charset="UTF-8"/><title>目录</title></head><body><nav epub:type="toc" id="toc"><h1>目录</h1><ol><li><a href="title.xhtml">书籍介绍</a></li>' + toc + '</ol></nav></body></html>'
  const title = header + start + '<title>' + escape(book.title) + '</title><link rel="stylesheet" type="text/css" href="book.css"/></head><body><p class="kicker">BENJAMIN TAOSON / TECHNICAL LIBRARY</p><h1>' + escape(book.title) + '</h1><p class="subtle">' + escape(book.titleEn) + '</p><p>' + escape(book.summary) + '</p><p class="subtle">当前版本仅含已发布的 ' + book.chapters.length + ' 章，持续更新。在线阅读：' + escape(ORIGIN + book.href) + '</p></body></html>'
  const chapterFiles = docs.map((doc, i) => ({
    name: 'OEBPS/chapter-' + (i + 1) + '.xhtml',
    data: header + start + '<title>' + escape(book.chapters[i].title) + '</title><link rel="stylesheet" type="text/css" href="book.css"/></head><body><p class="kicker">' + escape(book.title) + '</p><h1>' + escape((i + 1) + '. ' + book.chapters[i].title) + '</h1>' + markdownToHtml(doc.content, book, titles) + '</body></html>'
  }))
  return [
    { name: 'mimetype', data: 'application/epub+zip' },
    { name: 'META-INF/container.xml', data: header + '<container xmlns="urn:oasis:names:tc:opendocument:xmlns:container" version="1.0"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>' },
    { name: 'OEBPS/content.opf', data: metadata(book, docs) },
    { name: 'OEBPS/nav.xhtml', data: nav },
    { name: 'OEBPS/title.xhtml', data: title },
    { name: 'OEBPS/book.css', data: stylesheet },
    ...chapterFiles
  ]
}
function crc32(bytes) {
  let crc = 0xffffffff
  for (const b of bytes) {
    crc ^= b
    for (let i = 0; i < 8; i++) crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
  }
  return (crc ^ 0xffffffff) >>> 0
}
function zip(files) {
  const chunks = [], directory = []
  let offset = 0
  for (const file of files) {
    const name = Buffer.from(file.name), input = Buffer.from(file.data), method = file.name === 'mimetype' ? 0 : 8
    const compressed = method === 0 ? input : deflateRawSync(input, { level: 9 })
    const crc = crc32(input), local = Buffer.alloc(30), central = Buffer.alloc(46)
    local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x0800, 6)
    local.writeUInt16LE(method, 8); local.writeUInt32LE(crc, 14); local.writeUInt32LE(compressed.length, 18)
    local.writeUInt32LE(input.length, 22); local.writeUInt16LE(name.length, 26)
    central.writeUInt32LE(0x02014b50, 0); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6)
    central.writeUInt16LE(0x0800, 8); central.writeUInt16LE(method, 10); central.writeUInt32LE(crc, 16)
    central.writeUInt32LE(compressed.length, 20); central.writeUInt32LE(input.length, 24)
    central.writeUInt16LE(name.length, 28); central.writeUInt32LE(offset, 42)
    chunks.push(local, name, compressed); directory.push(central, name)
    offset += local.length + name.length + compressed.length
  }
  const length = directory.reduce((n, b) => n + b.length, 0), footer = Buffer.alloc(22)
  footer.writeUInt32LE(0x06054b50, 0); footer.writeUInt16LE(files.length, 8); footer.writeUInt16LE(files.length, 10)
  footer.writeUInt32LE(length, 12); footer.writeUInt32LE(offset, 16)
  return Buffer.concat([...chunks, ...directory, footer])
}
export async function generateEbooks({ siteDir = resolve('site'), outputDir = resolve('site/public/ebooks') } = {}) {
  await mkdir(outputDir, { recursive: true })
  const generated = []
  for (const book of books) {
    if (!book.chapters.length) throw new Error('Empty book: ' + book.id)
    const docs = await Promise.all(book.chapters.map(async (ch) => matter(await readFile(resolve(siteDir, ch.source), 'utf8'))))
    if (docs.some((doc) => doc.data.draft === true || !doc.content.trim())) throw new Error('Unpublished chapter in ' + book.id)
    const filename = resolve(outputDir, book.id + '.epub')
    const output = zip(createFiles(book, docs))
    await writeFile(filename, output)
    generated.push({ id: book.id, count: book.chapters.length, size: output.length })
  }
  return generated
}
if (process.argv[1] && resolve(process.argv[1]) === resolve(new URL(import.meta.url).pathname)) {
  generateEbooks().then((items) => items.forEach((item) => console.log(item.id + ': ' + item.count + ' chapters, ' + item.size + ' bytes')))
    .catch((error) => { console.error(error); process.exitCode = 1 })
}
