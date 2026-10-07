<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import noteIndex from '../../generated/note-index.json'

const courses = [
  {
    key: 'python',
    title: 'Python Engineering',
    subtitle: '工程基础与异步编程',
    description: '从 Python 基础语法进入类型、异步、接口与 AI 工程常用开发模式。',
    href: '/python/',
    topics: ['Python', 'Async', 'Engineering']
  },
  {
    key: 'langchain',
    title: 'LangChain',
    subtitle: 'Model · Message · Tool · Agent',
    description: '掌握模型接口、消息、工具调用与 Agent 构建的核心抽象。',
    href: '/langchain/',
    topics: ['Model', 'Tool', 'Agent']
  },
  {
    key: 'langgraph',
    title: 'LangGraph',
    subtitle: 'State · Node · Control Flow',
    description: '从 Python 环境准备开始，理解状态、节点、边与条件控制流。',
    href: '/langgraph/',
    topics: ['State', 'Graph', 'Control Flow']
  },
  {
    key: 'openclaw',
    title: 'OpenClaw',
    subtitle: 'Gateway · Agent Runtime · Source',
    description: '从官方 README 建立系统地图，厘清 Gateway、Agent Runtime 与设备能力的边界。',
    href: '/openclaw/',
    topics: ['Architecture', 'Runtime', '源码阅读']
  },
  {
    key: 'ai-coding',
    title: 'AI Coding',
    subtitle: 'Coding Agent · Workflow',
    description: '把 Codex、Claude Code 等工具纳入真实的软件工程工作流。',
    href: '/ai-coding/',
    topics: ['Coding Agent', 'Workflow']
  }
]

const notes = computed(() => noteIndex.notes || [])
const publishedCourses = computed(() => courses.filter((course) => courseCount(course.key) > 0))
const recentNotes = computed(() => [...notes.value]
  .sort((left, right) => (right.updated || right.date).localeCompare(left.updated || left.date))
  .slice(0, 6))
const featuredNote = computed(() => notes.value.find((note) => note.sourcePath === 'openclaw/01-readme-system-map.md')
  || notes.value.find((note) => note.featured)
  || recentNotes.value[0])

function courseCount(key: string) {
  return notes.value.filter((note: any) => note.category === key).length
}

function categoryLabel(category: string) {
  const labels: Record<string, string> = {
    python: 'Python',
    langchain: 'LangChain',
    langgraph: 'LangGraph',
    openclaw: 'OpenClaw',
    'ai-coding': 'AI Coding'
  }
  return labels[category] || category
}
</script>

<template>
  <main class="home-learning-hub">
    <section class="home-hero">
      <div class="home-hero__content">
        <p class="home-kicker">AI ENGINEERING NOTES</p>
        <h1>Agent 工程实践<br />与源码笔记</h1>
        <p class="home-hero__lead">这里是我的公开知识空间，记录 LangGraph 的基础概念、OpenClaw 的系统结构，以及 AI 开发中的学习与实践。按主题查阅，也可以沿着阅读路径逐篇展开。</p>
        <div class="home-hero__actions">
          <a v-if="featuredNote" class="home-button home-button--primary" :href="withBase(featuredNote.url)">阅读精选笔记 <span aria-hidden="true">→</span></a>
          <a class="home-button" :href="withBase('/updates/')">浏览全部笔记</a>
        </div>
      </div>

      <aside class="home-hero__panel" aria-label="笔记内容概览">
        <div class="home-hero__panel-top">
          <span class="home-status-dot"></span>
          <span>BENJAMIN'S NOTES</span>
        </div>
        <strong>从概念理解，到源码阅读</strong>
        <p>把学过的内容、参考来源和工程判断整理下来，让下一次查阅更容易。</p>
        <div class="home-hero__metrics">
          <div><b>{{ notes.length }}</b><span>篇笔记</span></div>
          <div><b>{{ publishedCourses.length }}</b><span>个主题</span></div>
          <div><b>{{ noteIndex.series.length }}</b><span>条阅读路径</span></div>
        </div>
        <a class="home-author-link" href="https://benjamindaoson.github.io/daoson_website/">返回个人官网 <span aria-hidden="true">↗</span></a>
      </aside>
    </section>

    <section class="home-section">
      <div class="home-section__heading">
        <div>
          <p class="home-section__eyebrow">TOPICS</p>
          <h2>按主题阅读</h2>
        </div>
        <p>从已整理的笔记出发，找到你关心的概念与系统。</p>
      </div>

      <div class="home-course-grid">
        <a v-for="(course, index) in publishedCourses" :key="course.key" class="home-course-card" :href="withBase(course.href)">
          <div class="home-course-card__top">
            <span class="home-course-card__index">{{ String(index + 1).padStart(2, '0') }}</span>
            <span class="home-course-card__count">{{ courseCount(course.key) }} 篇</span>
          </div>
          <h3>{{ course.title }}</h3>
          <p class="home-course-card__subtitle">{{ course.subtitle }}</p>
          <p class="home-course-card__description">{{ course.description }}</p>
          <div class="home-course-card__footer">
            <span v-for="topic in course.topics" :key="topic">{{ topic }}</span>
            <b>查看笔记 →</b>
          </div>
        </a>
      </div>
    </section>

    <section v-if="noteIndex.series.length" class="home-path-section">
      <div class="home-path-copy">
        <p class="home-section__eyebrow">LEARNING PATH</p>
        <h2>沿着一条线读下去</h2>
        <p>同一主题的文章按阅读顺序排列。可以从环境准备开始，也可以直接进入系统地图。</p>
        <a :href="withBase('/learning-paths/')">查看阅读路径 →</a>
      </div>
      <div class="home-reading-paths" aria-label="已发布阅读路径">
        <section v-for="series in noteIndex.series" :key="series.title">
          <h3>{{ series.title }}</h3>
          <ol>
            <li v-for="note in series.notes" :key="note.url"><a :href="withBase(note.url)">{{ note.title }}</a></li>
          </ol>
        </section>
      </div>
    </section>

    <section v-if="featuredNote" class="home-featured-course">
      <div class="home-featured-course__label">FEATURED NOTE</div>
      <div class="home-featured-course__body">
        <div>
          <p>精选阅读 · {{ featuredNote.updated || featuredNote.date }}</p>
          <h2>{{ featuredNote.title }}</h2>
          <p class="home-featured-course__description">{{ featuredNote.description }}</p>
        </div>
        <div class="home-featured-course__chapters">
          <span v-for="tag in featuredNote.tags" :key="tag">{{ tag }}</span>
        </div>
        <a class="home-button home-button--primary" :href="withBase(featuredNote.url)">阅读全文 <span aria-hidden="true">→</span></a>
      </div>
    </section>

    <section class="home-section home-section--updates">
      <div class="home-section__heading home-section__heading--compact">
        <div>
          <p class="home-section__eyebrow">LATEST</p>
          <h2>最近更新</h2>
        </div>
        <a :href="withBase('/updates/')">查看全部 →</a>
      </div>

      <div v-if="recentNotes.length" class="home-update-list">
        <a v-for="note in recentNotes" :key="note.url" class="home-update-row" :href="withBase(note.url)">
          <time>{{ note.updated || note.date }}</time>
          <span class="home-update-row__category">{{ categoryLabel(note.category) }}</span>
          <strong>{{ note.title }}</strong>
          <span class="home-update-row__meta">{{ note.readingMinutes }} min</span>
          <span class="home-update-row__arrow">→</span>
        </a>
      </div>
      <p v-else class="home-empty">发布后的笔记会按更新时间显示在这里。</p>
    </section>
  </main>
</template>
