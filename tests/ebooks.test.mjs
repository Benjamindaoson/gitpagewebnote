import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, access } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { inflateRawSync } from 'node:zlib'
import { books } from '../scripts/book-catalog.mjs'
import { generateEbooks } from '../scripts/generate-ebooks.mjs'

function unzipLocal(buf) {
  const files = new Map()
  let pos = 0
  while (pos + 30 < buf.length && buf.readUInt32LE(pos) === 0x04034b50) {
    const method = buf.readUInt16LE(pos + 8), len = buf.readUInt32LE(pos + 18)
    const nameLength = buf.readUInt16LE(pos + 26), extra = buf.readUInt16LE(pos + 28)
    const name = buf.subarray(pos + 30, pos + 30 + nameLength).toString()
    const start = pos + 30 + nameLength + extra
    const data = buf.subarray(start, start + len)
    files.set(name, method === 8 ? inflateRawSync(data) : data)
    pos = start + len
  }
  return files
}

test('books reference published chapters and real catalog pages', async () => {
  assert.equal(books.length, 2)
  for (const book of books) {
    assert.ok(book.chapters.length > 0)
    await access(resolve('site/books/' + book.id + '/index.md'))
    for (const chapter of book.chapters) {
      const original = await readFile(resolve('site', chapter.source), 'utf8')
      assert.match(original, /^---\n/)
      assert.ok(original.includes('\n# '))
    }
  }
})

test('each e-book is a valid EPUB3 structure with navigable, original XHTML chapters', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'taoson-epub-test-'))
  try {
    await generateEbooks({ outputDir: dir })
    for (const book of books) {
      const bin = await readFile(join(dir, book.id + '.epub'))
      assert.equal(bin.readUInt32LE(0), 0x04034b50)
      assert.equal(bin.readUInt16LE(8), 0, 'mimetype must be uncompressed')
      assert.equal(bin.subarray(38, 58).toString(), 'application/epub+zip')
      const files = unzipLocal(bin)
      assert.ok(files.has('META-INF/container.xml'))
      assert.match(files.get('OEBPS/content.opf').toString(), /version="3.0"/)
      assert.match(files.get('OEBPS/content.opf').toString(), /<meta property="dcterms:modified">\d{4}-\d\d-\d\dT00:00:00Z<\/meta>/)
      assert.match(files.get('OEBPS/nav.xhtml').toString(), /epub:type="toc"/)
      for (const [index, chapter] of book.chapters.entries()) {
        const xhtml = files.get('OEBPS/chapter-' + (index + 1) + '.xhtml')?.toString()
        assert.ok(xhtml)
        assert.ok(xhtml.includes(chapter.title))
        assert.match(xhtml, /<h1>/)
      }
    }
  } finally { await rm(dir, { recursive: true, force: true }) }
})
