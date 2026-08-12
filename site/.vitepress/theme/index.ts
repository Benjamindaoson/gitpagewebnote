import DefaultTheme from 'vitepress/theme'
import BrowseNotes from './components/BrowseNotes.vue'
import CoursePaths from './components/CoursePaths.vue'
import RecentNotes from './components/RecentNotes.vue'
import Layout from './Layout.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('BrowseNotes', BrowseNotes)
    app.component('CoursePaths', CoursePaths)
    app.component('RecentNotes', RecentNotes)
  }
}
