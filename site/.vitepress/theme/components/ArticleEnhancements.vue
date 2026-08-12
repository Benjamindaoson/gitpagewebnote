<script setup lang="ts">
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import noteIndex from '../../generated/note-index.json'

const { page } = useData()
const note = computed(() => noteIndex.notes.find((entry) => entry.sourcePath === page.value.relativePath))
const saved = computed({ get: () => typeof window !== 'undefined' && note.value ? localStorage.getItem(`benjamin-note-saved:${note.value.sourcePath}`) === 'true' : false, set: (value) => typeof window !== 'undefined' && note.value && localStorage.setItem(`benjamin-note-saved:${note.value.sourcePath}`, String(value)) })
</script>

<template>
  <section v-if="note" class="article-enhancements">
    <div class="article-enhancements__meta">
      <span v-if="note.featured" class="article-badge">精选</span>
      <span>发布于 {{ note.date }}</span>
      <span v-if="note.updated !== note.date">更新于 {{ note.updated }}</span>
      <span>阅读时长 {{ note.readingMinutes }} 分钟</span>
    </div>
    <button class="save-note" type="button" @click="saved = !saved">{{ saved ? '已加入稍后阅读' : '加入稍后阅读' }}</button>

    <section v-if="note.series" class="article-panel">
      <p class="article-panel__eyebrow">课程路径</p>
      <h2>{{ note.series }}</h2>
      <p>第 {{ note.seriesOrder }} 节</p>
      <div class="article-panel__links">
        <a v-if="note.seriesPrevious" :href="withBase(note.seriesPrevious.url)">← {{ note.seriesPrevious.title }}</a>
        <a v-if="note.seriesNext" :href="withBase(note.seriesNext.url)">{{ note.seriesNext.title }} →</a>
      </div>
    </section>

    <section v-if="note.changeLog.length" class="article-panel">
      <h2>内容变更</h2>
      <ul>
        <li v-for="entry in note.changeLog" :key="`${entry.date}-${entry.summary}`"><time>{{ entry.date }}</time> — {{ entry.summary }}</li>
      </ul>
    </section>

    <section v-if="note.appliesTo || note.sources.length" class="article-panel">
      <h2>适用版本与引用</h2>
      <p v-if="note.appliesTo">适用版本：{{ note.appliesTo }}</p>
      <ul v-if="note.sources.length"><li v-for="source in note.sources" :key="source.url"><a :href="source.url" target="_blank" rel="noreferrer">{{ source.title }}</a><span v-if="source.verified">（核验：{{ source.verified }}）</span></li></ul>
    </section>

    <section v-if="note.wikiLinks.length || note.backlinks.length || note.relatedNotes.length" class="article-panel">
      <h2>知识关联</h2>
      <div v-if="note.wikiLinks.length">
        <h3>文中链接</h3>
        <a v-for="entry in note.wikiLinks" :key="entry.url" :href="withBase(entry.url)">{{ entry.label }}</a>
      </div>
      <div v-if="note.backlinks.length">
        <h3>引用本文</h3>
        <a v-for="entry in note.backlinks" :key="entry.url" :href="withBase(entry.url)">{{ entry.title }}</a>
      </div>
      <div v-if="note.relatedNotes.length">
        <h3>继续阅读</h3>
        <a v-for="entry in note.relatedNotes" :key="entry.url" :href="withBase(entry.url)">{{ entry.title }}</a>
      </div>
    </section>
  </section>
</template>
