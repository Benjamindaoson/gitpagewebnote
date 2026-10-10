import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('the home page starts with the collection instead of a redundant hero', async () => {
  const home = await readFile('site/.vitepress/theme/components/BookShelf.vue', 'utf8')
  assert.match(home, /<main class="ebook-library">\s*<section class="library-collection"/)
  assert.doesNotMatch(home, /library-heading|home-hero|返回 Benjamin 的个人官网/)
  assert.match(home, /<h1 id="library-works-title">已上架的作品/)
  assert.match(home, /v-for="book in filteredBooks"/)
  assert.match(home, /books\.length >= 6/, 'Filters should wait until there are enough books to justify them')
})
