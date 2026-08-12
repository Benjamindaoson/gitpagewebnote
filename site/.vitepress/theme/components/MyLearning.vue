<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'
import noteIndex from '../../generated/note-index.json'
const revision = ref(0)
const states = computed(() => { revision.value; return noteIndex.notes.map((note) => ({ ...note, completed: typeof window !== 'undefined' && localStorage.getItem(`benjamin-note-complete:${note.sourcePath}`) === 'true', saved: typeof window !== 'undefined' && localStorage.getItem(`benjamin-note-saved:${note.sourcePath}`) === 'true' })) })
onMounted(() => { revision.value++ })
function toggle(note: any) { localStorage.setItem(`benjamin-note-saved:${note.sourcePath}`, String(!note.saved)); revision.value++ }
</script>
<template><section class="note-section"><h2>我的学习</h2><p>已完成 {{ states.filter(n => n.completed).length }} / {{ states.length }} 篇；数据仅保存在当前浏览器。</p><article v-for="note in states" :key="note.url" class="note-card"><a :href="withBase(note.url)">{{ note.title }}</a><button type="button" @click="toggle(note)">{{ note.saved ? '取消稍后读' : '稍后阅读' }}</button><span v-if="note.completed"> 已完成</span></article></section></template>
