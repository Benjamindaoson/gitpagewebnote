import DefaultTheme from 'vitepress/theme'
import BrowseNotes from './components/BrowseNotes.vue'
import CoursePaths from './components/CoursePaths.vue'
import KnowledgeMap from './components/KnowledgeMap.vue'
import ReadingProgress from './components/ReadingProgress.vue'
import MyLearning from './components/MyLearning.vue'
import PopularNotes from './components/PopularNotes.vue'
import PublishLog from './components/PublishLog.vue'
import RecentNotes from './components/RecentNotes.vue'
import Layout from './Layout.vue'
import './custom.css'
import './course-doc.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('BrowseNotes', BrowseNotes)
    app.component('CoursePaths', CoursePaths)
    app.component('KnowledgeMap', KnowledgeMap)
    app.component('ReadingProgress', ReadingProgress)
    app.component('MyLearning', MyLearning)
    app.component('PopularNotes', PopularNotes)
    app.component('PublishLog', PublishLog)
    app.component('RecentNotes', RecentNotes)
  }
}
