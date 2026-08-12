import { resolve } from 'node:path'
import { findMaintenanceWarnings, validateNotes } from './content-index.mjs'

const issues = await validateNotes({ siteDir: resolve('site') })

if (issues.length === 0) {
  console.log('Content validation passed.')
  for (const warning of await findMaintenanceWarnings({ siteDir: resolve('site') })) console.warn(`提醒：${warning.file}: ${warning.message}`)
} else {
  for (const issue of issues) {
    console.error(`${issue.file}: ${issue.message}`)
  }
  process.exitCode = 1
}
