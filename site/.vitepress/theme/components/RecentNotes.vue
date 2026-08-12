<script setup lang="ts">
import { withBase } from 'vitepress'
import noteIndex from '../../generated/note-index.json'
import NoteList from './NoteList.vue'
</script>

<template>
  <section class="note-section">
    <div class="note-section__heading">
      <h2>最近更新</h2>
      <a :href="withBase('/updates/')">查看全部 →</a>
    </div>
    <NoteList :notes="noteIndex.notes.slice(0, 6)" empty-text="发布第一篇笔记后，它会自动显示在这里。" />
  </section>
</template>
