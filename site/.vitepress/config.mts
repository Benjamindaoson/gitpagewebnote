import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitepress'
import { buildSidebar, CATEGORY_OPTIONS, loadNotes } from '../../scripts/content-index.mjs'

const siteDir = fileURLToPath(new URL('..', import.meta.url))

export default async () => {
  const notes = await loadNotes({ siteDir })
  const sidebar = buildSidebar(notes)

  for (const { value, label } of CATEGORY_OPTIONS) {
    sidebar[`/${value}/`][0].items.unshift({ text: `${label} 笔记首页`, link: `/${value}/` })
  }

  return defineConfig({
    lang: 'zh-CN',
    title: 'Benjamin 的 AI 笔记',
    description: 'AI、Python 与工程实践笔记',
    base: '/gitpagewebnote/',
    cleanUrls: true,
    lastUpdated: true,

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
            { text: '年度归档', link: '/archive/' }
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
        message: '使用 Markdown 与 VitePress 构建',
        copyright: 'Copyright © 2026 Benjamin Daoson'
      }
    }
  })
}
