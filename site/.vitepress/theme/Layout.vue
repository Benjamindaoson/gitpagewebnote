<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useData } from 'vitepress'
import ArticleEnhancements from './components/ArticleEnhancements.vue'
import EngagementWidgets from './components/EngagementWidgets.vue'
import ReadingProgress from './components/ReadingProgress.vue'
import ArticleTools from './components/ArticleTools.vue'
import DocArticleHeader from './components/DocArticleHeader.vue'
import DocAsideCards from './components/DocAsideCards.vue'
import DocSidebarHeader from './components/DocSidebarHeader.vue'

const { page } = useData()
const learningSections = ['python', 'langchain', 'langgraph', 'openclaw', 'ai-coding']
const isArticlePage = computed(() => {
  const relativePath = page.value.relativePath || ''
  return learningSections.some((section) => relativePath === `${section}/index.md` || relativePath.startsWith(`${section}/`))
})

const readingProgress = ref(0)
const expandedImage = ref('')
const expandedImageAlt = ref('')

function updateReadingProgress() {
  const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight
  readingProgress.value = scrollableHeight > 0 ? Math.min(100, (window.scrollY / scrollableHeight) * 100) : 0
}

function openImage(event: MouseEvent) {
  const target = event.target
  if (!(target instanceof HTMLImageElement) || !target.closest('.vp-doc')) return
  expandedImage.value = target.currentSrc || target.src
  expandedImageAlt.value = target.alt
}

onMounted(() => {
  updateReadingProgress()
  window.addEventListener('scroll', updateReadingProgress, { passive: true })
  document.addEventListener('click', openImage)
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateReadingProgress)
  document.removeEventListener('click', openImage)
})
</script>

<template>
  <div :class="{ 'course-doc-shell': isArticlePage }">
    <div class="reading-progress" :style="{ transform: `scaleX(${readingProgress / 100})` }" aria-hidden="true" />

    <DefaultTheme.Layout>
      <template #sidebar-nav-before>
        <DocSidebarHeader v-if="isArticlePage" />
      </template>

      <template #doc-before>
        <DocArticleHeader v-if="isArticlePage" />
      </template>

      <template #aside-bottom>
        <DocAsideCards v-if="isArticlePage" />
      </template>

      <template #doc-after>
        <ArticleTools />
        <ArticleEnhancements />
        <ReadingProgress />
        <EngagementWidgets />
      </template>
    </DefaultTheme.Layout>

    <button
      v-if="expandedImage"
      class="image-lightbox"
      type="button"
      :aria-label="`关闭图片预览：${expandedImageAlt || '图片'}`"
      @click="expandedImage = ''"
    >
      <img :src="expandedImage" :alt="expandedImageAlt" />
    </button>
  </div>
</template>
