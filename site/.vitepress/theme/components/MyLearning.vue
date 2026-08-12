<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'
import noteIndex from '../../generated/note-index.json'
const revision = ref(0)
const filter = ref<'all' | 'completed' | 'saved'>('all')
const states = computed(() => {
  revision.value
  return noteIndex.notes.map((note) => ({ ...note, completed: typeof window !== 'undefined' && localStorage.getItem(`benjamin-note-complete:${note.sourcePath}`) === 'true', saved: typeof window !== 'undefined' && localStorage.getItem(`benjamin-note-saved:${note.sourcePath}`) === 'true' }))
})
const visible = computed(() => filter.value === 'all' ? states.value : states.value.filter((note) => note[filter.value]))
const series = computed(() => noteIndex.series.map((entry) => {
  const notes = states.value.filter((note) => note.series === entry.title)
  const done = notes.filter((note) => note.completed).length
  return { ...entry, done, total: notes.length, percentage: notes.length ? Math.round(done / notes.length * 100) : 0 }
}))
onMounted(() => { revision.value++ })
function toggleSaved(note: any) { localStorage.setItem(`benjamin-note-saved:${note.sourcePath}`, String(!note.saved)); revision.value++ }
function toggleCompleted(note: any) { localStorage.setItem(`benjamin-note-complete:${note.sourcePath}`, String(!note.completed)); revision.value++ }
function setFilter(value: string) { if (value === 'all' || value === 'completed' || value === 'saved') filter.value = value }
</script>
<template>
  <section class="note-section">
    <h2>我的学习</h2><p>已完成 {{ states.filter(n => n.completed).length }} / {{ states.length }} 篇；数据仅保存在当前浏览器。</p>
    <div class="learning-filters"><button v-for="item in [{value:'all',label:'全部'}, {value:'completed',label:'已学完'}, {value:'saved',label:'稍后阅读'}]" :key="item.value" type="button" :aria-pressed="filter === item.value" @click="setFilter(item.value)">{{ item.label }}</button></div>
    <section v-if="series.length" class="learning-series"><h3>系列完成度</h3><article v-for="entry in series" :key="entry.title"><strong>{{ entry.title }}</strong><span>{{ entry.done }} / {{ entry.total }}（{{ entry.percentage }}%）</span><progress :value="entry.done" :max="entry.total" /></article></section>
    <article v-for="note in visible" :key="note.url" class="note-card"><a :href="withBase(note.url)">{{ note.title }}</a><div><button type="button" @click="toggleCompleted(note)">{{ note.completed ? '取消已学完' : '标记已学完' }}</button><button type="button" @click="toggleSaved(note)">{{ note.saved ? '取消稍后阅读' : '稍后阅读' }}</button></div></article>
  </section>
</template>
