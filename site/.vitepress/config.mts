import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'
import { buildKnowledgeNetwork, buildSidebar, CATEGORY_OPTIONS, loadNotes } from '../../scripts/content-index.mjs'
import { createSeoHead } from '../../scripts/site-seo.mjs'

const siteDir = fileURLToPath(new URL('..', import.meta.url))
const base = '/gitpagewebnote/'
const mainSiteUrl = 'https://benjamindaoson.github.io/daoson_website/'

function wikiLinkPlugin(markdown: any, urls: Map<string, string>) {
  markdown.inline.ruler.before('emphasis', 'note-wiki-link', (state: any, silent: boolean) => {
    if (state.src.slice(state.pos, state.pos + 2) !== '[[') return false
    const end = state.src.indexOf(']]', state.pos + 2)
    if (end === -1) return false
    const [titlePart, labelPart] = state.src.slice(state.pos + 2, end).split('|', 2)
    const title = titlePart.trim()
    const url = urls.get(title)
    if (!url) return false
    if (!silent) {
      const open = state.push('link_open', 'a', 1)
      open.attrSet('href', url)
      state.push('text', '', 0).content = (labelPart || title).trim()
      state.push('link_close', 'a', -1)
    }
    state.pos = end + 2
    return true
  })
}

export default async () => {
  const notes = await loadNotes({ siteDir })
  const network = buildKnowledgeNetwork(notes)
  const sidebar = buildSidebar(notes)
  const publishedCategories = CATEGORY_OPTIONS.filter(({ value }) => notes.some((note) => note.category === value))

  for (const { value, label } of CATEGORY_OPTIONS) {
    sidebar[`/${value}/`][0].items.unshift({ text: `${label} 笔记首页`, link: `/${value}/` })
  }

  return defineConfig({
    lang: 'zh-CN',
    title: 'Benjamin Taoson · 电子书架',
    description: 'Benjamin Taoson 的公开技术电子书：LangGraph 入门、OpenClaw 源码阅读与持续更新的学习笔记。',
    base,
    cleanUrls: true,
    lastUpdated: true,
    markdown: {
      theme: {
        light: 'github-dark',
        dark: 'github-dark'
      },
      config: (markdown) => wikiLinkPlugin(markdown, new Map(network.notes.map((note) => [note.title, note.url])))
    },
    transformHead: (context) => {
      const note = network.notes.find((entry) => entry.sourcePath === context.pageData.relativePath)
      const path = context.pageData.relativePath === 'index.md' ? '/' : `/${context.pageData.relativePath.replace(/\.md$/, '').replace(/\/index$/, '/')}`
      return createSeoHead({
        siteUrl: 'https://benjamindaoson.github.io/gitpagewebnote',
        path: note?.url || path,
        title: note?.title || context.pageData.title || 'Benjamin 的 AI 笔记',
        description: note?.description || context.pageData.description || 'AI、Python 与工程实践知识库。',
        image: note ? `/social/${note.sourcePath.replace(/\//g, '--').replace(/\.md$/, '')}.svg` : '/social/site.svg',
        article: note ? { date: note.date, updated: note.updated } : null
      })
    },

    themeConfig: {
      siteTitle: 'Benjamin Taoson · 书架',
      nav: [
        { text: '书架', link: '/' },
        { text: 'LangGraph 电子书', link: '/books/langgraph/' },
        { text: 'OpenClaw 电子书', link: '/books/openclaw/' },
        {
          text: '学习索引',
          items: [
            { text: '全部笔记', link: '/updates/' },
            { text: '分类浏览', link: '/categories/' },
            { text: '标签浏览', link: '/tags/' },
            { text: '阅读路径', link: '/learning-paths/' },
            { text: '知识地图', link: '/knowledge-map/' }
          ]
        },
        { text: '返回个人官网', link: mainSiteUrl }
      ],
      sidebar,
      search: {
        provider: 'local',
        options: {
          translations: {
            button: { buttonText: '搜索笔记', buttonAriaLabel: '搜索笔记' },
            modal: {
              noResultsText: '没有找到匹配内容',
              resetButtonTitle: '清除查询条件',
              footerButtonText: '关闭'
            }
          }
        }
      },
      outline: {
        level: [2, 3],
        label: '本页目录'
      },
      docFooter: {
        prev: '上一篇',
        next: '下一篇'
      },
      editLink: {
        pattern: 'https://github.com/Benjamindaoson/gitpagewebnote/edit/main/site/:path',
        text: '在 GitHub 编辑此页'
      },
      lastUpdated: {
        text: '最后更新于'
      },
      socialLinks: [
        { icon: 'github', link: 'https://github.com/Benjamindaoson/gitpagewebnote' }
      ],
      footer: {
        message: `使用 Markdown 与 VitePress 构建 · <a href="${base}feed.xml">订阅 RSS</a> · <a href="https://github.com/Benjamindaoson/gitpagewebnote/issues/new/choose">反馈</a>`,
        copyright: 'Copyright © 2026 Benjamin Taoson'
      }
    }
  })
}
