import { defineConfig } from 'vitepress'

export default defineConfig({
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
      { text: 'AI Coding', link: '/ai-coding/' }
    ],
    sidebar: {
      '/python/': [
        {
          text: 'Python',
          items: [{ text: 'Python 笔记首页', link: '/python/' }]
        }
      ],
      '/langchain/': [
        {
          text: 'LangChain',
          items: [{ text: 'LangChain 笔记首页', link: '/langchain/' }]
        }
      ],
      '/langgraph/': [
        {
          text: 'LangGraph 课件',
          items: [
            { text: '00 · 环境配置', link: '/langgraph/00-environment' },
            { text: '01 · 基础入门', link: '/langgraph/01-introduction' },
            { text: '02 · 控制流与节点执行', link: '/langgraph/02-control-flow' }
          ]
        }
      ],
      '/ai-coding/': [
        {
          text: 'AI Coding',
          items: [{ text: 'AI Coding 笔记首页', link: '/ai-coding/' }]
        }
      ]
    },
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
