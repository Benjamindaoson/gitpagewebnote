import assert from 'node:assert/strict'
import test from 'node:test'

test('site configuration defines the project Pages path and documentation UI', async () => {
  const { default: configFactory } = await import('../site/.vitepress/config.mts')
  assert.equal(typeof configFactory, 'function')
  const config = await configFactory()

  assert.equal(config.base, '/gitpagewebnote/')
  assert.equal(config.themeConfig.search.provider, 'local')
  assert.deepEqual(config.themeConfig.outline.level, [2, 3])
  assert.ok(config.themeConfig.nav.some((item) => item.text === '学习索引'))
  assert.ok(config.themeConfig.sidebar['/langgraph/'][0].items.some((item) => item.text === '00 · 环境配置'))
})
