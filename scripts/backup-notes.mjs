import { mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { execFile as execFileCallback } from 'node:child_process'
import { promisify } from 'node:util'

const execFile = promisify(execFileCallback)
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
const backupDirectory = resolve('backups')
const backupPath = resolve(backupDirectory, `gitpagewebnote-${stamp}.bundle`)

await mkdir(backupDirectory, { recursive: true })
await execFile('git', ['bundle', 'create', backupPath, '--all'], { cwd: process.cwd() })
console.log(`Repository backup created: ${backupPath}`)
