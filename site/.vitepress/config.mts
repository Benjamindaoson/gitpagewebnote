import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'
import { buildKnowledgeNetwork, buildSidebar, CATEGORY_OPTIONS, loadNotes } from '../../scripts/content-index.mjs'

const siteDir = fileURLToPath(new URL('..', import.meta.url))
const base = '/gitpagewebnote/'

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

  for (const { value, label } of CATEGORY_OPTIONS) {
    sidebar[`/${value}/`][0].items.unshift({ text: `${label} 笔记首页`, link: `/${value}/` })
  }

  return defineConfig({
    lang: 'zh-CN',
    title: 'Benjamin 的 AI 笔记',
    description: 'AI、Python 与工程实践笔记',
    base,
    cleanUrls: true,
    lastUpdated: true,
    markdown: {
      config: (markdown) => wikiLinkPlugin(markdown, new Map(network.notes.map((note) => [note.title, note.url])))
    },
    transformHead: (context) => {
      const note = network.notes.find((entry) => entry.sourcePath === context.pageData.relativePath)
      if (!note) return []
      const image = `${base}social/${note.sourcePath.replace(/\//g, '--').replace(/\.md$/, '')}.svg`
      return [['meta', { property: 'og:image', content: image }], ['meta', { name: 'twitter:card', content: 'summary_large_image' }]]
    },

    themeConfig: {
      siteTitle: 'Benjamin 的 AI 笔记',
      nav: [
        { text: '首页', link: '/' },
        { text: 'Python', link: '/python/' },
        { text: 'LangChain', link: '/langchain/' },
        { text: 'LangGraph', link: '/langgraph/00-environment' },
        { text: 'AI Coding', link: '/ai-coding/' },
        {
          text: '学习索引',
          items: [
            { text: '最近更新', link: '/updates/' },
            { text: '分类浏览', link: '/categories/' },
            { text: '标签浏览', link: '/tags/' },
            { text: '年度归档', link: '/archive/' },
            { text: '学习路径', link: '/learning-paths/' },
            { text: '知识地图', link: '/knowledge-map/' }
          ]
        }
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
        copyright: 'Copyright © 2026 Benjamin Daoson'
      }
    }
  })
}
