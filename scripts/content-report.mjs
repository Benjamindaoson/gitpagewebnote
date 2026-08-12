import { resolve } from 'node:path'
import { buildKnowledgeNetwork, findMaintenanceWarnings, loadNotes } from './content-index.mjs'

const siteDir = resolve('site')
const network = buildKnowledgeNetwork(await loadNotes({ siteDir }))
const stale = await findMaintenanceWarnings({ siteDir })
const health = {
  published: network.notes.length,
  stale: stale.map((item) => item.file),
  withoutSources: network.notes.filter((note) => note.sources.length === 0).map((note) => note.sourcePath),
  isolated: network.notes.filter((note) => note.wikiLinks.length === 0 && note.backlinks.length === 0).map((note) => note.sourcePath)
}
console.log(JSON.stringify(health, null, 2))
