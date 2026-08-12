import assert from 'node:assert/strict'
import test from 'node:test'

test('site configuration defines the project Pages path and documentation UI', async () => {
  const { default: config } = await import('../site/.vitepress/config.mts')

  assert.equal(config.base, '/gitpagewebnote/')
  assert.equal(config.themeConfig.search.provider, 'local')
  assert.deepEqual(config.themeConfig.outline.level, [2, 3])
  assert.equal(config.themeConfig.nav.length, 5)
})
