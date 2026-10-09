import assert from 'node:assert/strict'
import { access } from 'node:fs/promises'
import { resolve } from 'node:path'
import test from 'node:test'

test('site configuration defines the project Pages path and documentation UI', async () => {
  const { default: configFactory } = await import('../site/.vitepress/config.mts')
  assert.equal(typeof configFactory, 'function')
  const config = await configFactory()

  assert.equal(config.base, '/gitpagewebnote/')
  assert.equal(config.themeConfig.search.provider, 'local')
  assert.deepEqual(config.themeConfig.outline.level, [2, 3])
  assert.ok(config.themeConfig.nav.some((item) => item.text === '学习索引'))
  assert.ok(config.themeConfig.nav.some((item) => item.text === 'OpenClaw 电子书' && item.link === '/books/openclaw/'))
  assert.ok(config.themeConfig.nav.some((item) => item.text === '书架' && item.link === '/'))
  assert.ok(config.themeConfig.nav.some((item) => item.text === 'LangGraph 电子书' && item.link === '/books/langgraph/'))
  assert.ok(config.themeConfig.sidebar['/openclaw/'])
  assert.ok(config.themeConfig.sidebar['/langgraph/'][0].items.some((item) => item.text === '00 · 环境配置'))

  const personalSiteLink = config.themeConfig.nav.find((item) => item.text === '返回个人官网')
  assert.deepEqual(personalSiteLink, {
    text: '返回个人官网',
    link: 'https://benjamindaoson.github.io/daoson_website/'
  })
})

test('every top-level note category link has a generated category route', async () => {
  for (const category of ['python', 'langchain', 'langgraph', 'openclaw', 'ai-coding']) {
    await access(resolve('site', category, 'index.md'))
  }
})
