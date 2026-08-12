<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useData } from 'vitepress'

const { page } = useData()
const completed = ref(false)
const key = computed(() => `benjamin-note-complete:${page.value.relativePath}`)

function restore() { completed.value = localStorage.getItem(key.value) === 'true' }
function save() { localStorage.setItem(key.value, String(completed.value)) }
onMounted(() => { restore(); watch(key, restore) })
</script>

<template>
  <label v-if="page.frontmatter.category" class="reading-complete"><input v-model="completed" type="checkbox" @change="save"> 我已学完本篇（仅保存在此浏览器）</label>
</template>
