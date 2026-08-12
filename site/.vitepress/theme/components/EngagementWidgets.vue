<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useData, withBase } from 'vitepress'
import { engagement, isGiscusEnabled, isGoatCounterEnabled } from '../engagement.mjs'

const { page } = useData()
const giscusRoot = ref<HTMLElement | null>(null)
const isArticle = computed(() => Boolean(page.value.frontmatter.category) && page.value.frontmatter.draft !== true)
let giscusScript: HTMLScriptElement | null = null

function loadGoatCounter() {
  if (!isGoatCounterEnabled() || document.querySelector('script[data-note-goatcounter]')) return
  const script = document.createElement('script')
  script.async = true
  script.src = 'https://gc.zgo.at/count.js'
  script.dataset.noteGoatcounter = 'true'
  script.dataset.goatcounter = `https://${engagement.goatCounterCode}.goatcounter.com/count`
  document.head.append(script)
}

function renderGiscus() {
  giscusScript?.remove()
  giscusScript = null
  if (!isArticle.value || !isGiscusEnabled() || !giscusRoot.value) return
  const script = document.createElement('script')
  const giscus = engagement.giscus
  script.src = 'https://giscus.app/client.js'
  script.async = true
  script.crossOrigin = 'anonymous'
  script.setAttribute('data-repo', giscus.repo)
  script.setAttribute('data-repo-id', giscus.repoId)
  script.setAttribute('data-category', giscus.category)
  script.setAttribute('data-category-id', giscus.categoryId)
  script.setAttribute('data-mapping', giscus.mapping)
  script.setAttribute('data-strict', giscus.strict)
  script.setAttribute('data-reactions-enabled', giscus.reactionsEnabled)
  script.setAttribute('data-emit-metadata', giscus.emitMetadata)
  script.setAttribute('data-input-position', giscus.inputPosition)
  script.setAttribute('data-theme', giscus.theme)
  script.setAttribute('data-lang', giscus.lang)
  giscusRoot.value.replaceChildren(script)
  giscusScript = script
}

function openHelpFeedback(helpful: boolean) {
  const url = new URL(engagement.feedbackUrl)
  url.searchParams.set('title', helpful ? '内容有帮助' : '内容需要改进')
  url.searchParams.set('body', `文章：${window.location.href}\n反馈：${helpful ? '有帮助' : '需要改进'}\n\n补充说明：`)
  window.open(url, '_blank', 'noopener,noreferrer')
}

onMounted(() => {
  loadGoatCounter()
  watch(() => page.value.relativePath, async () => {
    await nextTick()
    renderGiscus()
  }, { immediate: true })
})

onBeforeUnmount(() => giscusScript?.remove())
</script>

<template>
  <section v-if="isArticle" class="engagement-widgets">
    <p class="engagement-widgets__title">订阅与反馈</p>
    <p><a :href="withBase('/feed.xml')">订阅 RSS 更新</a><span aria-hidden="true"> · </span><a :href="engagement.feedbackUrl" target="_blank" rel="noreferrer">提交反馈</a></p>
    <p class="helpful-feedback">本页有帮助吗？ <button type="button" @click="openHelpFeedback(true)">有帮助</button><button type="button" @click="openHelpFeedback(false)">需要改进</button></p>
    <div v-if="isGiscusEnabled()" ref="giscusRoot" class="engagement-widgets__comments" aria-label="文章评论" />
  </section>
</template>
