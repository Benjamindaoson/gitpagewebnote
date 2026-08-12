<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'
import noteIndex from '../../generated/note-index.json'
import { engagement, isGoatCounterEnabled } from '../engagement.mjs'
const counts = ref<Record<string, number>>({})
const fallback = computed(() => [...noteIndex.notes].sort((a, b) => Number(b.featured) - Number(a.featured) || b.updated.localeCompare(a.updated)).slice(0, 5))
const popular = computed(() => isGoatCounterEnabled() && Object.keys(counts.value).length ? [...noteIndex.notes].sort((a, b) => (counts.value[b.url] || 0) - (counts.value[a.url] || 0)).slice(0, 5) : fallback.value)
onMounted(async () => {
  if (!isGoatCounterEnabled()) return
  const code = engagement.goatCounterCode.trim()
  const results = await Promise.all(noteIndex.notes.map(async (note) => { try { const response = await fetch(`https://${code}.goatcounter.com/counter/${encodeURIComponent(note.url)}.json`); const data = await response.json(); return [note.url, Number(data.count) || 0] as const } catch { return [note.url, 0] as const } }))
  counts.value = Object.fromEntries(results)
})
</script>
<template><section class="note-section"><h2>热门文章</h2><p v-if="!isGoatCounterEnabled()">尚未配置统计时，按精选与更新时间推荐；配置 GoatCounter 后自动按访问量排序。</p><ol class="popular-notes"><li v-for="note in popular" :key="note.url"><a :href="withBase(note.url)">{{ note.title }}</a><small v-if="counts[note.url]">{{ counts[note.url] }} 次浏览</small></li></ol></section></template>
