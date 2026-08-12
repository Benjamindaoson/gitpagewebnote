import assert from 'node:assert/strict'
import test from 'node:test'

test('creates complete absolute Open Graph and Twitter metadata for notes', async () => {
  const { createSeoHead } = await import('../scripts/site-seo.mjs')
  const head = createSeoHead({
    siteUrl: 'https://example.com/notes',
    path: '/langgraph/intro',
    title: 'LangGraph intro',
    description: 'A practical introduction.',
    image: '/social/langgraph--intro.svg',
    article: { date: '2026-08-12', updated: '2026-08-13' }
  })
  const metadata = Object.fromEntries(head.filter(([tag]) => tag === 'meta').map(([, attributes]) => [attributes.property || attributes.name, attributes.content]))
  assert.equal(metadata['og:type'], 'article')
  assert.equal(metadata['og:url'], 'https://example.com/notes/langgraph/intro')
  assert.equal(metadata['og:image'], 'https://example.com/notes/social/langgraph--intro.svg')
  assert.equal(metadata['twitter:image'], metadata['og:image'])
  assert.equal(metadata['og:locale'], 'zh_CN')
})

test('lays out any number of knowledge-map nodes inside a dynamic canvas', async () => {
  const { buildKnowledgeMapLayout } = await import('../scripts/knowledge-map-layout.mjs')
  const layout = buildKnowledgeMapLayout(Array.from({ length: 13 }, (_, index) => ({ url: `/note-${index}` })))
  assert.equal(layout.nodes.length, 13)
  assert.ok(layout.height > 640)
  assert.ok(layout.nodes.every((node) => node.y + layout.radius <= layout.height))
  assert.equal(layout.indexByUrl.get('/note-12'), 12)
})
