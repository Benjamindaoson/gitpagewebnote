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
    <header class="library-heading">
      <p class="library-eyebrow">BENJAMIN TAOSON / READING LIBRARY</p>
      <div class="library-heading-grid">
        <div>
          <h1>知识书架<span class="library-title-dot">.</span></h1>
          <p class="library-lead">把技术笔记整理成可以一章章读的电子书。这里展示已公开的作品，内容持续更新，免费阅读。</p>
        </div>
        <a class="library-back-link" href="https://benjamindaoson.github.io/daoson_website/">
          返回 Benjamin 的个人官网 <span aria-hidden="true">↗</span>
        </a>
      </div>
    </header>

    <section class="library-collection" aria-labelledby="library-works-title">
      <div class="library-toolbar">
        <div>
          <p class="library-eyebrow">THE COLLECTION</p>
          <h2 id="library-works-title">已上架的作品 <span>{{ books.length.toString().padStart(2, '0') }}</span></h2>
        </div>
        <label class="library-search-label">
          <span class="sr-only">搜索书籍与章节</span>
          <span aria-hidden="true">⌕</span>
          <input v-model="search" type="search" placeholder="搜索书名、主题或章节" autocomplete="off" />
        </label>
      </div>

      <div class="library-filter" aria-label="按主题筛选书籍">
        <button
          v-for="topic in topics" :key="topic" type="button"
          :aria-pressed="activeTopic === topic"
          @click="activeTopic = topic"
        >{{ topic }}</button>
      </div>

      <div v-if="filteredBooks.length" class="ebook-grid">
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
    <footer class="library-tail">
      <p>这些小册由已公开的笔记整理，不把计划中的章节当作成品。新的文章和书籍会在完成后加入书架。</p>
      <a :href="withBase('/updates/')">按时间浏览原始笔记 <span aria-hidden="true">↗</span></a>
    </footer>
  </main>
</template>
