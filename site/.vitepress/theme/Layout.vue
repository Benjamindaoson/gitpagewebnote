<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { onMounted, onUnmounted, ref } from 'vue'
import ArticleEnhancements from './components/ArticleEnhancements.vue'
import EngagementWidgets from './components/EngagementWidgets.vue'
import ReadingProgress from './components/ReadingProgress.vue'
import ArticleTools from './components/ArticleTools.vue'

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
  <div class="reading-progress" :style="{ transform: `scaleX(${readingProgress / 100})` }" aria-hidden="true" />
  <DefaultTheme.Layout>
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
</template>
