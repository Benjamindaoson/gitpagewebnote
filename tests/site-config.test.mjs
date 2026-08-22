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
  assert.ok(config.themeConfig.nav.some((item) => item.text === 'OpenClaw'))
  assert.ok(config.themeConfig.sidebar['/openclaw/'])
  assert.ok(config.themeConfig.sidebar['/langgraph/'][0].items.some((item) => item.text === '00 · 环境配置'))

  const personalSiteMenu = config.themeConfig.nav.find((item) => item.text === '个人主页')
  assert.deepEqual(personalSiteMenu?.items, [
    { text: '关于作者', link: 'https://benjamindaoson.github.io/daoson_website/about/' },
    { text: '返回主站', link: 'https://benjamindaoson.github.io/daoson_website/' },
    { text: '项目案例', link: 'https://benjamindaoson.github.io/daoson_website/projects/' }
  ])
})

test('every top-level note category link has a generated category route', async () => {
  for (const category of ['python', 'langchain', 'langgraph', 'openclaw', 'ai-coding']) {
    await access(resolve('site', category, 'index.md'))
  }
})
