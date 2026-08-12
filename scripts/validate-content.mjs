import { resolve } from 'node:path'
import { validateNotes } from './content-index.mjs'

const issues = await validateNotes({ siteDir: resolve('site') })

if (issues.length === 0) {
  console.log('Content validation passed.')
} else {
  for (const issue of issues) {
    console.error(`${issue.file}: ${issue.message}`)
  }
  process.exitCode = 1
}
