<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import noteIndex from '../../generated/note-index.json'

const nodes = computed(() => noteIndex.notes)
const edges = computed(() => nodes.value.flatMap((note, index) => note.wikiLinks.map((link) => ({
  key: `${note.url}-${link.url}`,
  from: index,
  to: nodes.value.findIndex((item) => item.url === link.url)
}))).filter((edge) => edge.to >= 0))
</script>

<template>
  <section class="knowledge-map">
    <p>节点按栏目着色；连线代表双链。点击节点阅读文章。</p>
    <svg viewBox="0 0 900 520" role="img" aria-label="知识地图">
      <line v-for="edge in edges" :key="edge.key" :x1="90 + (edge.from % 4) * 240" :y1="100 + Math.floor(edge.from / 4) * 180" :x2="90 + (edge.to % 4) * 240" :y2="100 + Math.floor(edge.to / 4) * 180" class="knowledge-map__edge" />
      <a v-for="(note, index) in nodes" :key="note.url" :href="withBase(note.url)"><circle :cx="90 + (index % 4) * 240" :cy="100 + Math.floor(index / 4) * 180" r="52" :class="`knowledge-map__node knowledge-map__node--${note.category}`"/><text :x="90 + (index % 4) * 240" :y="108 + Math.floor(index / 4) * 180" text-anchor="middle" class="knowledge-map__label">{{ note.title.slice(0, 8) }}</text></a>
    </svg>
  </section>
</template>
