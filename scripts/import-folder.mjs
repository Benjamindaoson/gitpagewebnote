import { readdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { runInteractiveImport } from './import-note.mjs'

const directory = process.argv[2]
if (!directory) throw new Error('用法：npm run note:import-folder -- <Markdown 文件夹>')
const entries = await readdir(resolve(directory), { withFileTypes: true })
const files = entries.filter((entry) => entry.isFile() && entry.name.endsWith('.md')).map((entry) => resolve(directory, entry.name))
if (files.length === 0) throw new Error('该文件夹没有 Markdown 文件。')
for (const file of files) await runInteractiveImport(file)
