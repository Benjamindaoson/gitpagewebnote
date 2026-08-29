<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'
import noteIndex from '../../generated/note-index.json'

const courses = [
  {
    key: 'python',
    index: '01',
    title: 'Python Engineering',
    subtitle: '工程基础与异步编程',
    description: '从 Python 基础语法进入类型、异步、接口与 AI 工程常用开发模式。',
    href: '/python/',
    topics: ['Python', 'Async', 'Engineering']
  },
  {
    key: 'langchain',
    index: '02',
    title: 'LangChain',
    subtitle: 'Model · Message · Tool · Agent',
    description: '掌握模型接口、消息、工具调用与 Agent 构建的核心抽象。',
    href: '/langchain/',
    topics: ['Model', 'Tool', 'Agent']
  },
  {
    key: 'langgraph',
    index: '03',
    title: 'LangGraph',
    subtitle: 'State · Node · Runtime',
    description: '理解状态图、控制流、持久化与长程 Agent Runtime。',
    href: '/langgraph/',
    topics: ['State', 'Graph', 'Runtime']
  },
  {
    key: 'openclaw',
    index: '04',
    title: 'Agent Systems',
    subtitle: 'Harness · Memory · Runtime',
    description: '从框架使用进入 Agent Harness、记忆、恢复与可靠执行。',
    href: '/openclaw/',
    topics: ['Harness', 'Memory', 'Runtime']
  },
  {
    key: 'ai-coding',
    index: '05',
    title: 'AI Coding',
    subtitle: 'Coding Agent · Workflow',
    description: '把 Codex、Claude Code 等工具纳入真实的软件工程工作流。',
    href: '/ai-coding/',
    topics: ['Coding Agent', 'Workflow']
  }
]

const notes = computed(() => noteIndex.notes || [])
const recentNotes = computed(() => notes.value.slice(0, 6))

function courseCount(key: string) {
  return notes.value.filter((note: any) => note.category === key).length
}

function categoryLabel(category: string) {
  const labels: Record<string, string> = {
    python: 'Python',
    langchain: 'LangChain',
    langgraph: 'LangGraph',
    openclaw: 'Agent Systems',
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
        <h1>系统学习 LangChain、LangGraph<br />与 Agent Engineering</h1>
        <p class="home-hero__lead">代码、原理、源码与工程实践。把零散学习整理成一套可以持续迭代的 AI Engineering 技术教材。</p>
        <div class="home-hero__actions">
          <a class="home-button home-button--primary" :href="withBase('/langchain/')">开始学习 LangChain <span>→</span></a>
          <a class="home-button" :href="withBase('/learning-paths/')">查看学习路径</a>
        </div>
      </div>

      <aside class="home-hero__panel" aria-label="当前学习主线">
        <div class="home-hero__panel-top">
          <span class="home-status-dot"></span>
          <span>CURRENT TRACK</span>
        </div>
        <strong>LangChain → LangGraph → Agent Systems</strong>
        <p>从模型调用开始，一直深入到状态、工具、持久化与生产级 Agent Runtime。</p>
        <div class="home-hero__metrics">
          <div><b>{{ notes.length }}</b><span>篇笔记</span></div>
          <div><b>5</b><span>学习模块</span></div>
          <div><b>2026</b><span>持续更新</span></div>
        </div>
      </aside>
    </section>

    <section class="home-section">
      <div class="home-section__heading">
        <div>
          <p class="home-section__eyebrow">CURRICULUM</p>
          <h2>核心学习模块</h2>
        </div>
        <p>不是按博客分类浏览，而是按工程能力逐层推进。</p>
      </div>

      <div class="home-course-grid">
        <a v-for="course in courses" :key="course.key" class="home-course-card" :href="withBase(course.href)">
          <div class="home-course-card__top">
            <span class="home-course-card__index">{{ course.index }}</span>
            <span class="home-course-card__count">{{ courseCount(course.key) }} 篇</span>
          </div>
          <h3>{{ course.title }}</h3>
          <p class="home-course-card__subtitle">{{ course.subtitle }}</p>
          <p class="home-course-card__description">{{ course.description }}</p>
          <div class="home-course-card__footer">
            <span v-for="topic in course.topics" :key="topic">{{ topic }}</span>
            <b>进入课程 →</b>
          </div>
        </a>
      </div>
    </section>

    <section class="home-path-section">
      <div class="home-path-copy">
        <p class="home-section__eyebrow">LEARNING PATH</p>
        <h2>推荐学习路径</h2>
        <p>先掌握应用层统一接口，再进入状态管理与 Agent Runtime。每一层都建立在上一层之上。</p>
        <a :href="withBase('/learning-paths/')">查看完整路线 →</a>
      </div>
      <div class="home-path-flow" aria-label="推荐学习路径">
        <div><span>01</span><strong>Python</strong><small>工程基础</small></div>
        <i>→</i>
        <div><span>02</span><strong>LangChain</strong><small>模型与工具</small></div>
        <i>→</i>
        <div><span>03</span><strong>LangGraph</strong><small>状态与控制流</small></div>
        <i>→</i>
        <div><span>04</span><strong>Agent Systems</strong><small>Runtime 与 Harness</small></div>
      </div>
    </section>

    <section class="home-featured-course">
      <div class="home-featured-course__label">FEATURED COURSE</div>
      <div class="home-featured-course__body">
        <div>
          <p>正在编写</p>
          <h2>LangChain 实战教程</h2>
          <p class="home-featured-course__description">从模型接口、国产模型接入开始，逐步进入 Message、Prompt、Tool、Agent 与生产级应用。</p>
        </div>
        <div class="home-featured-course__chapters">
          <span>MODEL</span><span>MESSAGE</span><span>TOOL</span><span>AGENT</span>
        </div>
        <a class="home-button home-button--primary" :href="withBase('/langchain/')">继续学习 <span>→</span></a>
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
      <p v-else class="home-empty">发布第一篇课程笔记后，它会自动显示在这里。</p>
    </section>
  </main>
</template>
