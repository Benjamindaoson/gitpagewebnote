// One publication record, reused by the website and EPUB build.
// Only published source notes can be listed as chapters.
export const books = [
  {
    id: 'langgraph',
    href: '/books/langgraph/',
    title: 'LangGraph 入门与控制流',
    titleEn: 'LangGraph: State & Control Flow',
    coverLines: ['LangGraph', '入门与控制流'],
    number: '01',
    topic: 'Agent 框架',
    tag: '实践笔记',
    stage: '持续更新',
    summary: '从搭建环境开始，认识状态、节点和边，再理解顺序执行与条件分支。把三篇已公开笔记整理为可连贯阅读的小册。',
    coverTop: '#173c39',
    coverBottom: '#23564c',
    accent: '#b8e7c0',
    symbol: '↗',
    chapters: [
      { title: '环境配置', source: 'langgraph/00-environment.md', href: '/langgraph/00-environment' },
      { title: 'State、Node 与 Edge', source: 'langgraph/01-introduction.md', href: '/langgraph/01-introduction' },
      { title: '控制流与节点执行', source: 'langgraph/02-control-flow.md', href: '/langgraph/02-control-flow' }
    ]
  },
  {
    id: 'openclaw',
    href: '/books/openclaw/',
    title: 'OpenClaw 源码阅读手册',
    titleEn: 'Reading OpenClaw Source',
    coverLines: ['OpenClaw', '源码阅读手册'],
    number: '02',
    topic: '源码研读',
    tag: '源码陪读',
    stage: '持续更新',
    summary: '从固定版本的官方 README 出发，建立 Gateway、Agent Runtime、Session、Tools 与设备能力的系统地图。当前公开第一章。',
    coverTop: '#3d3431',
    coverBottom: '#765645',
    accent: '#f1d3a6',
    symbol: '⌘',
    chapters: [
      { title: '从 README 建立系统地图', source: 'openclaw/01-readme-system-map.md', href: '/openclaw/01-readme-system-map' }
    ]
  }
]

export function bookById(id) {
  return books.find((book) => book.id === id)
}
