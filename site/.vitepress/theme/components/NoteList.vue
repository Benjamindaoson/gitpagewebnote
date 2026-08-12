<script setup lang="ts">
import { withBase } from 'vitepress'

type Note = {
  title: string
  category: string
  tags: string[]
  date: string
  description: string
  difficulty: string
  updated: string
  featured: boolean
  url: string
  readingMinutes: number
}

defineProps<{
  notes: Note[]
  emptyText?: string
}>()
</script>

<template>
  <p v-if="notes.length === 0" class="note-list-empty">{{ emptyText ?? '暂时没有文章。' }}</p>
  <div v-else class="note-list">
    <article v-for="note in notes" :key="note.url" class="note-card">
      <p class="note-card__meta">
        <span v-if="note.featured" class="article-badge">精选</span>
        <span>{{ note.date }}</span>
        <span v-if="note.updated !== note.date">更新于 {{ note.updated }}</span>
        <span>{{ note.readingMinutes }} 分钟阅读</span>
        <span v-if="note.difficulty">{{ note.difficulty }}</span>
      </p>
      <h2><a :href="withBase(note.url)">{{ note.title }}</a></h2>
      <p class="note-card__description">{{ note.description }}</p>
      <div class="note-card__tags">
        <span v-for="tag in note.tags" :key="tag"># {{ tag }}</span>
      </div>
    </article>
  </div>
</template>
