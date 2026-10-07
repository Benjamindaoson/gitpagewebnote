<script setup lang="ts">
import { computed } from 'vue'
import noteIndex from '../../generated/note-index.json'
import NoteList from './NoteList.vue'

const props = defineProps<{ mode: 'updates' | 'categories' | 'tags' | 'archive' }>()
const recentNotes = computed(() => [...noteIndex.notes].sort((left, right) =>
  (right.updated || right.date).localeCompare(left.updated || left.date)
))
const publishedCategories = computed(() => noteIndex.categories.filter((group) => group.notes.length > 0))
</script>

<template>
  <NoteList v-if="props.mode === 'updates'" :notes="recentNotes" />

  <template v-else-if="props.mode === 'categories'">
    <section v-for="group in publishedCategories" :key="group.value" class="note-section" :id="group.value">
      <h2>{{ group.label }} <small>({{ group.notes.length }})</small></h2>
      <NoteList :notes="group.notes" :empty-text="`还没有 ${group.label} 笔记。`" />
    </section>
  </template>

  <template v-else-if="props.mode === 'tags'">
    <section v-for="group in noteIndex.tags" :key="group.tag" class="note-section" :id="group.tag">
      <h2># {{ group.tag }} <small>({{ group.notes.length }})</small></h2>
      <NoteList :notes="group.notes" />
    </section>
  </template>

  <template v-else>
    <section v-for="group in noteIndex.years" :key="group.year" class="note-section" :id="group.year">
      <h2>{{ group.year }}</h2>
      <NoteList :notes="group.notes" />
    </section>
  </template>
</template>
