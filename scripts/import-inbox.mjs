import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { importInbox } from './inbox-importer.mjs'
import { validateNotes } from './content-index.mjs'

export async function runInboxImport({ publish = process.argv.includes('--publish') } = {}) {
  const result = await importInbox({ inboxDir: resolve('note/inbox'), siteDir: resolve('site'), base: '/gitpagewebnote/', publish })
  const issues = await validateNotes({ siteDir: resolve('site') })
  console.log(JSON.stringify({ ...result, validationIssues: issues }, null, 2))
  if (result.failed.length || issues.length) process.exitCode = 1
  return result
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  runInboxImport().catch((error) => { console.error(error.message); process.exitCode = 1 })
}
