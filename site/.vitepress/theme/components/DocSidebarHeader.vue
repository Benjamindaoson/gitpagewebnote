<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'

const { page, frontmatter } = useData()
const activeCategory = computed(() => {
  const explicit = String(frontmatter.value.category || '')
  if (explicit) return explicit
  const relativePath = page.value.relativePath || ''
  return relativePath.split('/')[0] || ''
})

const sections = [
  { label: '首页', href: '/', key: 'home', mark: 'H' },
  { label: 'Python', href: '/python/', key: 'python', mark: 'Py' },
  { label: 'LangChain', href: '/langchain/', key: 'langchain', mark: 'LC' },
  { label: 'LangGraph', href: '/langgraph/', key: 'langgraph', mark: 'LG' },
  { label: 'OpenClaw', href: '/openclaw/', key: 'openclaw', mark: 'OC' },
  { label: 'AI Coding', href: '/ai-coding/', key: 'ai-coding', mark: 'AI' }
]

function openSearch() {
  if (typeof document === 'undefined') return

  const button = document.querySelector<HTMLElement>(
    '.VPNavBarSearch button, .DocSearch-Button, button[aria-label="搜索笔记"]'
  )

  if (button) {
    button.click()
    return
  }

  document.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'k',
      code: 'KeyK',
      ctrlKey: true,
      bubbles: true
    })
  )
}
</script>

<template>
  <div class="course-sidebar-header">
    <a class="course-sidebar-brand" :href="withBase('/')">
      <span class="course-sidebar-brand__mark">AI</span>
      <span class="course-sidebar-brand__copy">
        <strong>Benjamin 的 AI 笔记</strong>
        <small>把学习沉淀成可检索的知识库</small>
      </span>
    </a>

    <button class="course-sidebar-search" type="button" aria-label="搜索笔记" @click="openSearch">
      <span class="course-sidebar-search__icon" aria-hidden="true">⌕</span>
      <span>搜索笔记...</span>
      <kbd>Ctrl K</kbd>
    </button>

    <nav class="course-sidebar-global-nav" aria-label="知识库导航">
      <a
        v-for="item in sections"
        :key="item.key"
        :href="withBase(item.href)"
        class="course-sidebar-global-link"
        :class="{ 'is-active': activeCategory === item.key }"
        :aria-current="activeCategory === item.key ? 'page' : undefined"
      >
        <span class="course-sidebar-global-link__mark">{{ item.mark }}</span>
        <span>{{ item.label }}</span>
      </a>
    </nav>
  </div>
</template>
