<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { bookById } from '../../../../scripts/book-catalog.mjs'
const props = defineProps<{ id: string }>()
const book = computed(() => bookById(props.id))
</script>

<template>
  <main v-if="book" class="ebook-detail">
    <a class="ebook-back" :href="withBase('/')"><span aria-hidden="true">←</span> 返回书架</a>
    <section class="ebook-detail-hero">
      <div class="ebook-detail-cover">
        <div class="ebook-cover" :style="{ '--cover-top': book.coverTop, '--cover-bottom': book.coverBottom, '--cover-accent': book.accent }">
          <div class="ebook-cover-spine" aria-hidden="true"></div>
          <div class="ebook-cover-inner">
            <span class="ebook-cover-brand">BENJAMIN TAOSON<br />TECHNICAL LIBRARY</span>
            <span class="ebook-cover-symbol" aria-hidden="true">{{ book.symbol }}</span>
            <strong class="ebook-cover-title"><span v-for="line in book.coverLines" :key="line">{{ line }}</span></strong>
            <span class="ebook-cover-bottom"><span>VOL. {{ book.number }}</span><span>FIELD NOTES / 2026</span></span>
          </div>
        </div>
      </div>
      <div class="ebook-detail-intro">
        <p class="library-eyebrow">DIGITAL EDITION / {{ book.topic }}</p>
        <h1>{{ book.title }}</h1>
        <p class="ebook-detail-subtitle">{{ book.titleEn }}</p>
        <p class="ebook-detail-summary">{{ book.summary }}</p>
        <div class="ebook-detail-facts">
          <span>作者 · Benjamin Taoson</span>
          <span>{{ book.chapters.length }} 章已发布</span>
          <span>{{ book.stage }}</span>
          <span>免费公开阅读</span>
        </div>
        <div class="ebook-detail-actions">
          <a class="ebook-button ebook-button-primary" :href="withBase(book.chapters[0].href)">开始阅读 <span aria-hidden="true">→</span></a>
          <a class="ebook-button ebook-button-secondary" :href="withBase('/ebooks/' + book.id + '.epub')" :download="book.id + '.epub'">下载 EPUB <span aria-hidden="true">↓</span></a>
        </div>
        <p class="ebook-detail-disclaimer">当前版本只收录已经发布的正文，不含尚未完成的章节。EPUB 文件随站点构建从原笔记自动生成。</p>
      </div>
    </section>
    <section class="ebook-table-of-contents" aria-labelledby="ebook-contents-title">
      <div>
        <p class="library-eyebrow">TABLE OF CONTENTS</p>
        <h2 id="ebook-contents-title">本书目录</h2>
      </div>
      <ol>
        <li v-for="(chapter, i) in book.chapters" :key="chapter.source">
          <a :href="withBase(chapter.href)"><span class="ebook-chapter-number">{{ String(i + 1).padStart(2, '0') }}</span><span>{{ chapter.title }}</span><span class="ebook-chapter-arrow" aria-hidden="true">↗</span></a>
        </li>
      </ol>
    </section>
    <aside class="ebook-detail-foot">
      <strong>关于这个版本</strong>
      <p>在线章节保留可追溯的原始笔记页面，书籍目录提供连续阅读顺序。新增内容会先公开为笔记，再按阅读逻辑编入电子书。</p>
      <a href="https://benjamindaoson.github.io/daoson_website/">认识作者与项目 <span aria-hidden="true">↗</span></a>
    </aside>
  </main>
  <p v-else>作品未找到。<a :href="withBase('/')">返回书架</a></p>
</template>
