import { execFile as execFileCallback } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { basename, extname, resolve, relative } from 'node:path'
import { pathToFileURL } from 'node:url'
import { promisify } from 'node:util'
import { createInterface } from 'node:readline/promises'
import matter from 'gray-matter'
import { CATEGORY_OPTIONS, validateNotes } from './content-index.mjs'
import { createImportPlan, writeImport } from './note-importer.mjs'

const execFile = promisify(execFileCallback)
const TAG_OPTIONS = ['Python', 'LangChain', 'LangGraph', 'Agent', 'RAG', 'AI Coding', '工程实践']
const DIFFICULTY_OPTIONS = [
  { value: 'beginner', label: '入门' },
  { value: 'intermediate', label: '进阶' },
  { value: 'advanced', label: '高级' }
]

function today() {
  return new Date().toISOString().slice(0, 10)
}

function detectText(sourcePath, source) {
  const parsed = matter(source)
  const heading = parsed.content.match(/^#\s+(.+)$/m)?.[1]?.trim()
  const paragraph = parsed.content
    .replace(/^#.+$/gm, '')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .split(/\n\s*\n/)
    .map((item) => item.trim().replace(/\n+/g, ' '))
    .find((item) => item.length > 10)

  return {
    title: parsed.data.title || heading || basename(sourcePath, extname(sourcePath)),
    description: parsed.data.description || paragraph || '从本地 Markdown 导入的笔记。'
  }
}

async function chooseOne(reader, question, options) {
  const renderedOptions = options.map((option, index) => `  ${index + 1}. ${option.label}`).join('\n')
  while (true) {
    const answer = (await reader.question(`${question}\n${renderedOptions}\n请选择编号：`)).trim()
    const selected = Number(answer)
    if (Number.isInteger(selected) && selected >= 1 && selected <= options.length) return options[selected - 1]
    console.log('请输入有效的编号。')
  }
}

async function chooseText(reader, label, detectedValue) {
  const selection = await chooseOne(reader, `${label}：检测到“${detectedValue}”`, [
    { value: 'detected', label: '使用检测结果（推荐）' },
    { value: 'custom', label: '自定义输入' }
  ])
  if (selection.value === 'detected') return detectedValue

  while (true) {
    const customValue = (await reader.question(`请输入${label}：`)).trim()
    if (customValue) return customValue
    console.log(`${label}不能为空。`)
  }
}

async function chooseTags(reader) {
  const options = TAG_OPTIONS.map((tag) => ({ value: tag, label: tag }))
  console.log(`选择标签，可用逗号选择多个编号：\n${options.map((option, index) => `  ${index + 1}. ${option.label}`).join('\n')}`)
  while (true) {
    const answer = (await reader.question('请输入标签编号，例如 3,4：')).trim()
    const selections = [...new Set(answer.split(',').map((value) => Number(value.trim())).filter(Number.isInteger))]
    if (selections.length > 0 && selections.every((index) => index >= 1 && index <= options.length)) {
      return selections.map((index) => options[index - 1].value)
    }
    console.log('请输入一个或多个有效的标签编号。')
  }
}

async function chooseDate(reader) {
  const selection = await chooseOne(reader, '发布日期', [
    { value: today(), label: `使用今天（${today()}，推荐）` },
    { value: 'custom', label: '自定义日期' }
  ])
  if (selection.value !== 'custom') return selection.value

  while (true) {
    const value = (await reader.question('请输入日期（YYYY-MM-DD）：')).trim()
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
    console.log('日期格式应为 YYYY-MM-DD。')
  }
}

async function runGit(args) {
  await execFile('git', args, { cwd: process.cwd() })
}

async function publishImport(result, metadata, action) {
  const gitPaths = [relative(process.cwd(), result.notePath), ...result.assetPaths.map((path) => relative(process.cwd(), path))]
  await runGit(['add', '--', ...gitPaths])
  await runGit(['commit', '-m', `docs: import ${metadata.title}`])
  if (action === 'push') await runGit(['push'])
}

export async function runInteractiveImport(sourcePath, { reader: suppliedReader, siteDir = resolve('site') } = {}) {
  const resolvedSourcePath = resolve(sourcePath)
  const source = await readFile(resolvedSourcePath, 'utf8')
  const detected = detectText(resolvedSourcePath, source)
  const reader = suppliedReader ?? createInterface({ input: process.stdin, output: process.stdout })
  const ownsReader = !suppliedReader

  try {
    console.log('\n开始导入笔记。除自定义标题或摘要外，所有设置均为编号选择。\n')
    const title = await chooseText(reader, '标题', detected.title)
    const description = await chooseText(reader, '摘要', detected.description)
    const category = await chooseOne(reader, '所属栏目', CATEGORY_OPTIONS)
    const tags = await chooseTags(reader)
    const difficulty = await chooseOne(reader, '难度', DIFFICULTY_OPTIONS)
    const date = await chooseDate(reader)
    const visibility = await chooseOne(reader, '笔记状态', [
      { value: false, label: '公开发布（推荐）' },
      { value: true, label: '保存为草稿，不出现在公开导航中' }
    ])
    const action = await chooseOne(reader, '导入完成后执行什么操作', [
      { value: 'import', label: '仅导入到本地工作区（推荐）' },
      { value: 'commit', label: '导入并创建 Git 提交' },
      { value: 'push', label: '导入、提交并推送到 GitHub Pages' }
    ])

    const metadata = {
      title,
      description,
      category: category.value,
      tags,
      difficulty: difficulty.value,
      date,
      draft: visibility.value
    }
    const plan = await createImportPlan({
      sourcePath: resolvedSourcePath,
      siteDir,
      metadata,
      base: '/gitpagewebnote/'
    })
    const result = await writeImport(plan)
    const issues = await validateNotes({ siteDir })
    if (issues.length > 0) {
      throw new Error(`笔记已导入，但内容校验失败：\n${issues.map((issue) => `${issue.file}: ${issue.message}`).join('\n')}`)
    }

    if (action.value !== 'import') await publishImport(result, metadata, action.value)

    console.log(`\n导入成功：${result.notePath}`)
    console.log(`已复制图片：${result.assetPaths.length} 个`)
    if (action.value === 'push') console.log('已推送到 GitHub，GitHub Pages 将自动发布。')
    if (action.value === 'commit') console.log('已创建 Git 提交；运行 git push 即可发布。')
    if (action.value === 'import') console.log('文件仅写入本地；检查后可自行提交，或再次选择发布选项。')
    return result
  } finally {
    if (ownsReader) reader.close()
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const sourcePath = process.argv[2]
  if (!sourcePath) {
    console.error('用法：npm run note:import -- <Markdown 文件路径>')
    process.exitCode = 1
  } else {
    runInteractiveImport(sourcePath).catch((error) => {
      console.error(`\n导入失败：${error.message}`)
      process.exitCode = 1
    })
  }
}
