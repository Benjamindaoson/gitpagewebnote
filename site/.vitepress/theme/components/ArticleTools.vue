<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const readingMode = ref(false)
const query = ref('')
function searchInArticle() { if (query.value.trim()) window.find(query.value.trim(), false, false, true, false, false, false) }
async function copyCode() {
  for (const block of document.querySelectorAll<HTMLElement>('.vp-doc pre code')) {
    if (block.parentElement?.querySelector('.note-copy-code')) continue
    const button = document.createElement('button')
    button.className = 'note-copy-code'; button.type = 'button'; button.textContent = '复制'
    button.addEventListener('click', async () => { await navigator.clipboard.writeText(block.textContent || ''); button.textContent = '已复制'; window.setTimeout(() => { button.textContent = '复制' }, 1200) })
    block.parentElement?.append(button)
  }
}
function syncMode() { document.documentElement.classList.toggle('note-reading-mode', readingMode.value) }
onMounted(() => { copyCode(); syncMode() })
onUnmounted(() => document.documentElement.classList.remove('note-reading-mode'))
</script>
<template><div class="article-tools" aria-label="阅读工具"><label>页内搜索 <input v-model="query" type="search" placeholder="输入关键词" @keyup.enter="searchInArticle" /></label><button type="button" @click="searchInArticle">查找</button><button type="button" :aria-pressed="readingMode" @click="readingMode = !readingMode; syncMode()">{{ readingMode ? '退出阅读模式' : '阅读模式' }}</button></div></template>
