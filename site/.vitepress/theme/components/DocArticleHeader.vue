<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'

const { page, frontmatter } = useData()

const category = computed(() => String(frontmatter.value.category || ''))
const categoryLabel = computed(() => {
  const labels: Record<string, string> = {
    python: 'Python',
    langchain: 'LangChain',
    langgraph: 'LangGraph',
    openclaw: 'OpenClaw',
    'ai-coding': 'AI Coding'
  }
  return labels[category.value] || category.value
})
</script>

<template>
  <div v-if="category" class="course-doc-breadcrumb" aria-label="面包屑导航">
    <a :href="withBase(`/${category}/`)">{{ categoryLabel }} 教程</a>
    <span aria-hidden="true">›</span>
    <span>{{ page.title }}</span>
  </div>
</template>
