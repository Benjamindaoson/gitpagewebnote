import { readdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { runInteractiveImport } from './import-note.mjs'

const directory = process.argv[2]
if (!directory) throw new Error('用法：npm run note:import-folder -- <Markdown 文件夹>')
async function discoverMarkdown(directoryPath) {
  const entries = await readdir(directoryPath, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const entryPath = resolve(directoryPath, entry.name)
    if (entry.isDirectory()) files.push(...await discoverMarkdown(entryPath))
    else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) files.push(entryPath)
  }
  return files
}
const files = await discoverMarkdown(resolve(directory))
if (files.length === 0) throw new Error('该文件夹没有 Markdown 文件。')
for (const file of files) await runInteractiveImport(file)
