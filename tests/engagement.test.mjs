import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import test from 'node:test'

test('keeps reader engagement disabled until public provider identifiers are configured', async () => {
  const { engagement, isGiscusEnabled, isGoatCounterEnabled } = await import('../site/.vitepress/theme/engagement.mjs')

  assert.equal(engagement.goatCounterCode, '')
  assert.equal(isGoatCounterEnabled(engagement), false)
  assert.equal(isGiscusEnabled(engagement), false)
})

test('defines conditional GoatCounter and Giscus integrations without private credentials', async () => {
  const source = await readFile(resolve('site/.vitepress/theme/components/EngagementWidgets.vue'), 'utf8')
  const config = await readFile(resolve('site/.vitepress/theme/engagement.mjs'), 'utf8')

  assert.match(source, /gc\.zgo\.at\/count\.js/)
  assert.match(source, /giscus\.app\/client\.js/)
  assert.match(source, /isGoatCounterEnabled/)
  assert.match(source, /isGiscusEnabled/)
  assert.doesNotMatch(config, /token|secret|password/i)
})
