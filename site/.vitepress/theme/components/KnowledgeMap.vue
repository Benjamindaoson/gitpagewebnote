<script setup lang="ts">
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'
import { buildKnowledgeMapLayout } from '../../../../scripts/knowledge-map-layout.mjs'
import noteIndex from '../../generated/note-index.json'

const category = ref('')
const tag = ref('')
const activeUrl = ref('')
const layout = computed(() => buildKnowledgeMapLayout(noteIndex.notes))
const tags = computed(() => [...new Set(noteIndex.notes.flatMap((note) => note.tags))].sort((left, right) => left.localeCompare(right, 'zh-CN')))
const visibleNodes = computed(() => layout.value.nodes.filter((note) => (!category.value || note.category === category.value) && (!tag.value || note.tags.includes(tag.value))))
const visibleUrls = computed(() => new Set(visibleNodes.value.map((note) => note.url)))
const edges = computed(() => visibleNodes.value.flatMap((note) => note.wikiLinks.filter((link) => visibleUrls.value.has(link.url)).map((link) => ({ key: `${note.url}-${link.url}`, from: note, to: layout.value.nodes[layout.value.indexByUrl.get(link.url)!] }))))
const neighbors = computed(() => {
  const values = new Set<string>()
  if (!activeUrl.value) return values
  values.add(activeUrl.value)
  for (const edge of edges.value) if (edge.from.url === activeUrl.value || edge.to.url === activeUrl.value) { values.add(edge.from.url); values.add(edge.to.url) }
  return values
})
function isMuted(url: string) { return Boolean(activeUrl.value) && !neighbors.value.has(url) }
</script>

<template>
  <section class="knowledge-map">
    <p>节点按栏目着色；连线代表双链。可筛选并使用鼠标或键盘聚焦节点查看相邻笔记。</p>
    <div class="knowledge-map__filters"><label>栏目 <select v-model="category"><option value="">全部</option><option v-for="entry in noteIndex.categories" :key="entry.value" :value="entry.value">{{ entry.label }}</option></select></label><label>标签 <select v-model="tag"><option value="">全部</option><option v-for="entry in tags" :key="entry" :value="entry">{{ entry }}</option></select></label></div>
    <svg :viewBox="`0 0 ${layout.width} ${layout.height}`" role="group" aria-labelledby="knowledge-map-title knowledge-map-description">
      <title id="knowledge-map-title">知识地图</title><desc id="knowledge-map-description">文章节点和它们之间的双向链接。节点可使用键盘访问。</desc>
      <line v-for="edge in edges" :key="edge.key" :x1="edge.from.x" :y1="edge.from.y" :x2="edge.to.x" :y2="edge.to.y" :class="['knowledge-map__edge', { 'knowledge-map__edge--muted': activeUrl && (!neighbors.has(edge.from.url) || !neighbors.has(edge.to.url)) }]" />
      <a v-for="note in visibleNodes" :key="note.url" :href="withBase(note.url)" :aria-label="`阅读：${note.title}`" @mouseenter="activeUrl = note.url" @mouseleave="activeUrl = ''" @focus="activeUrl = note.url" @blur="activeUrl = ''"><title>{{ note.title }}</title><circle :cx="note.x" :cy="note.y" :r="layout.radius" :class="['knowledge-map__node', `knowledge-map__node--${note.category}`, { 'knowledge-map__node--muted': isMuted(note.url) }]"/><text :x="note.x" :y="note.y + 5" text-anchor="middle" class="knowledge-map__label">{{ note.title.length > 10 ? `${note.title.slice(0, 10)}…` : note.title }}</text></a>
    </svg>
    <section class="knowledge-map__fallback" aria-label="知识节点文本列表"><h2>知识节点列表</h2><ul><li v-for="note in visibleNodes" :key="note.url"><a :href="withBase(note.url)">{{ note.title }}</a><span v-if="note.wikiLinks.length"> → {{ note.wikiLinks.map(link => link.label).join('、') }}</span></li></ul></section>
  </section>
</template>
