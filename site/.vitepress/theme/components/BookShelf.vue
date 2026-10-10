<script setup lang="ts">
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'
import { books } from '../../../../scripts/book-catalog.mjs'

const activeTopic = ref('全部')
const search = ref('')
const topics = ['全部', ...new Set(books.map((book) => book.topic))]
const filteredBooks = computed(() => books.filter((book) => {
  const matchesTopic = activeTopic.value === '全部' || book.topic === activeTopic.value
  const query = search.value.trim().toLocaleLowerCase()
  const haystack = [book.title, book.titleEn, book.summary, book.topic, ...book.chapters.map((chapter) => chapter.title)].join(' ').toLocaleLowerCase()
  return matchesTopic && (!query || haystack.includes(query))
}))
</script>

<template>
  <main class="ebook-library">
    <section class="library-collection" aria-labelledby="library-works-title">
      <div class="library-toolbar">
        <div>
          <h1 id="library-works-title">已上架的作品 <span>{{ books.length.toString().padStart(2, '0') }}</span></h1>
        </div>
        <label v-if="books.length >= 6" class="library-search-label">
          <span class="sr-only">搜索书籍与章节</span>
          <span aria-hidden="true">⌕</span>
          <input v-model="search" type="search" placeholder="搜索书名、主题或章节" autocomplete="off" />
        </label>
      </div>

      <div v-if="books.length >= 6" class="library-filter" aria-label="按主题筛选书籍">
        <button
          v-for="topic in topics" :key="topic" type="button"
          :aria-pressed="activeTopic === topic"
          @click="activeTopic = topic"
        >{{ topic }}</button>
      </div>

      <div v-if="filteredBooks.length" class="ebook-grid" :class="{ 'ebook-grid--short': filteredBooks.length < 3 }">
        <article v-for="book in filteredBooks" :key="book.id" class="ebook-card">
          <a class="ebook-card-cover-link" :href="withBase(book.href)" :aria-label="'打开《' + book.title + '》'">
            <div class="ebook-cover" :style="{ '--cover-top': book.coverTop, '--cover-bottom': book.coverBottom, '--cover-accent': book.accent }">
              <div class="ebook-cover-spine" aria-hidden="true"></div>
              <div class="ebook-cover-inner">
                <span class="ebook-cover-brand">BENJAMIN TAOSON<br />TECHNICAL LIBRARY</span>
                <span class="ebook-cover-symbol" aria-hidden="true">{{ book.symbol }}</span>
                <strong class="ebook-cover-title"><span v-for="line in book.coverLines" :key="line">{{ line }}</span></strong>
                <span class="ebook-cover-bottom"><span>VOL. {{ book.number }}</span><span>FIELD NOTES / 2026</span></span>
              </div>
            </div>
          </a>
          <div class="ebook-card-information">
            <p class="ebook-card-meta">{{ book.topic }} <span aria-hidden="true">·</span> {{ book.chapters.length }} 章已发布</p>
            <h3><a :href="withBase(book.href)">{{ book.title }}</a></h3>
            <p class="ebook-card-description">{{ book.summary }}</p>
            <div class="ebook-card-footer">
              <span>{{ book.stage }}</span>
              <a :href="withBase(book.href)">打开这本书 <span aria-hidden="true">↗</span></a>
            </div>
          </div>
        </article>
      </div>
      <p v-else class="library-empty">没有找到匹配的作品。试试其他关键词，或切换到“全部”。</p>
    </section>

  </main>
</template>
