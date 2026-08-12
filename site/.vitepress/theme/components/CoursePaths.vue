<script setup lang="ts">
import { withBase } from 'vitepress'
import noteIndex from '../../generated/note-index.json'
</script>

<template>
  <section class="course-paths">
    <p v-if="noteIndex.series.length === 0" class="note-list-empty">课程整理完成后会自动显示在这里。</p>
    <section v-for="series in noteIndex.series" :key="series.title" class="course-paths__series">
      <h2>{{ series.title }}</h2>
      <ol>
        <li v-for="note in series.notes" :key="note.url"><a :href="withBase(note.url)">{{ note.title }}</a></li>
      </ol>
    </section>
  </section>
</template>
