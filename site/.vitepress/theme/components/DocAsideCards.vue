<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'

const { page, frontmatter } = useData()

const tags = computed(() => {
  const value = frontmatter.value.tags
  return Array.isArray(value) ? value.map(String) : []
})

const sourcePath = computed(() => page.value.relativePath)
const sourceUrl = computed(
  () => `https://github.com/Benjamindaoson/gitpagewebnote/blob/main/site/${sourcePath.value}`
)
const editUrl = computed(
  () => `https://github.com/Benjamindaoson/gitpagewebnote/edit/main/site/${sourcePath.value}`
)

const difficulty = computed(() => {
  const value = String(frontmatter.value.difficulty || '')
  const labels: Record<string, string> = {
    beginner: '入门',
    intermediate: '进阶',
    advanced: '高级'
  }
  return labels[value] || value
})
</script>

<template>
  <div class="course-aside-cards">
    <section
      v-if="tags.length || frontmatter.series || difficulty"
      class="course-aside-card course-aside-card--knowledge"
    >
      <p class="course-aside-card__eyebrow">知识信息</p>
      <div v-if="tags.length" class="course-aside-tags">
        <span v-for="tag in tags" :key="tag">{{ tag }}</span>
      </div>
      <dl v-if="frontmatter.series || difficulty" class="course-aside-meta">
        <template v-if="frontmatter.series">
          <dt>路径</dt>
          <dd>{{ frontmatter.series }}</dd>
        </template>
        <template v-if="difficulty">
          <dt>难度</dt>
          <dd>{{ difficulty }}</dd>
        </template>
      </dl>
    </section>

    <section class="course-aside-card course-aside-card--source">
      <p class="course-aside-card__eyebrow">本页源文件</p>
      <code>{{ sourcePath }}</code>
      <div class="course-aside-card__actions">
        <a :href="sourceUrl" target="_blank" rel="noreferrer">在 GitHub 中查看 →</a>
        <a :href="editUrl" target="_blank" rel="noreferrer">编辑此页</a>
      </div>
    </section>
  </div>
</template>
