import { execFile as execFileCallback, spawn } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { basename, extname, relative, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { promisify } from 'node:util'
import { createInterface } from 'node:readline/promises'
import matter from 'gray-matter'
import { CATEGORY_OPTIONS, validateNotes } from './content-index.mjs'
import { createImportPlan, recommendNoteMetadata, writeImport } from './note-importer.mjs'

const execFile = promisify(execFileCallback)
const TAG_OPTIONS = ['Python', 'LangChain', 'LangGraph', 'Agent', 'RAG', 'AI Coding', '\u5de5\u7a0b\u5b9e\u8df5']
const DIFFICULTY_OPTIONS = [
  { value: 'beginner', label: '\u5165\u95e8' },
  { value: 'intermediate', label: '\u8fdb\u9636' },
  { value: 'advanced', label: '\u9ad8\u7ea7' }
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
    description: parsed.data.description || paragraph || '\u4ece\u672c\u5730 Markdown \u5bfc\u5165\u7684\u7b14\u8bb0\u3002'
  }
}

async function chooseOne(reader, question, options) {
  const renderedOptions = options.map((option, index) => `  ${index + 1}. ${option.label}`).join('\n')
  while (true) {
    const answer = (await reader.question(`${question}\n${renderedOptions}\n\u8bf7\u9009\u62e9\u7f16\u53f7\uff1a`)).trim()
    const selected = Number(answer)
    if (Number.isInteger(selected) && selected >= 1 && selected <= options.length) return options[selected - 1]
    console.log('\u8bf7\u8f93\u5165\u6709\u6548\u7684\u7f16\u53f7\u3002')
  }
}

async function chooseText(reader, label, detectedValue) {
  const selection = await chooseOne(reader, `${label}\uff1a\u68c0\u6d4b\u5230\u201c${detectedValue}\u201d`, [
    { value: 'detected', label: '\u4f7f\u7528\u68c0\u6d4b\u7ed3\u679c\uff08\u63a8\u8350\uff09' },
    { value: 'custom', label: '\u81ea\u5b9a\u4e49\u8f93\u5165' }
  ])
  if (selection.value === 'detected') return detectedValue

  while (true) {
    const customValue = (await reader.question(`\u8bf7\u8f93\u5165${label}\uff1a`)).trim()
    if (customValue) return customValue
    console.log(`${label}\u4e0d\u80fd\u4e3a\u7a7a\u3002`)
  }
}

async function chooseTags(reader) {
  const options = TAG_OPTIONS.map((tag) => ({ value: tag, label: tag }))
  console.log(`\u9009\u62e9\u6807\u7b7e\uff0c\u53ef\u7528\u9017\u53f7\u9009\u62e9\u591a\u4e2a\u7f16\u53f7\uff1a\n${options.map((option, index) => `  ${index + 1}. ${option.label}`).join('\n')}`)
  while (true) {
    const answer = (await reader.question('\u8bf7\u8f93\u5165\u6807\u7b7e\u7f16\u53f7\uff0c\u4f8b\u5982 3,4\uff1a')).trim()
    const selections = [...new Set(answer.split(',').map((value) => Number(value.trim())).filter(Number.isInteger))]
    if (selections.length > 0 && selections.every((index) => index >= 1 && index <= options.length)) return selections.map((index) => options[index - 1].value)
    console.log('\u8bf7\u8f93\u5165\u4e00\u4e2a\u6216\u591a\u4e2a\u6709\u6548\u7684\u6807\u7b7e\u7f16\u53f7\u3002')
  }
}

function withRecommendedFirst(options, recommendedValue) {
  return options.map((option) => ({ ...option, label: option.value === recommendedValue ? `${option.label}（推荐）` : option.label }))
}

async function chooseRecommendedTags(reader, recommended) {
  const options = TAG_OPTIONS.map((tag) => ({
    value: tag,
    label: recommended.includes(tag) ? `${tag}（推荐）` : tag
  }))
  console.log(`本地分析推荐标签：${recommended.join('、') || '无'}。可用逗号选择多个编号：\n${options.map((option, index) => `  ${index + 1}. ${option.label}`).join('\n')}`)
  while (true) {
    const answer = (await reader.question('请输入标签编号，例如 1,2：')).trim()
    const selections = [...new Set(answer.split(',').map((value) => Number(value.trim())).filter(Number.isInteger))]
    if (selections.length > 0 && selections.every((index) => index >= 1 && index <= options.length)) return selections.map((index) => options[index - 1].value)
    console.log('请输入一个或多个有效的标签编号。')
  }
}

async function chooseDate(reader) {
  const selection = await chooseOne(reader, '\u53d1\u5e03\u65e5\u671f', [
    { value: today(), label: `\u4f7f\u7528\u4eca\u5929\uff08${today()}\uff0c\u63a8\u8350\uff09` },
    { value: 'custom', label: '\u81ea\u5b9a\u4e49\u65e5\u671f' }
  ])
  if (selection.value !== 'custom') return selection.value
  while (true) {
    const value = (await reader.question('\u8bf7\u8f93\u5165\u65e5\u671f\uff08YYYY-MM-DD\uff09\uff1a')).trim()
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
    console.log('\u65e5\u671f\u683c\u5f0f\u5e94\u4e3a YYYY-MM-DD\u3002')
  }
}

async function runGit(args) {
  await execFile('git', args, { cwd: process.cwd() })
}

export function summarizeImportPlan(plan) {
  return {
    targetNotePath: plan.targetNotePath,
    category: plan.metadata.category,
    tags: plan.metadata.tags,
    imageCount: plan.assetCopies.length,
    createdFiles: [plan.targetNotePath, ...plan.assetCopies.map((asset) => asset.targetPath)]
  }
}

export function formatImportSummary(summary) {
  return [
    '\u5bfc\u5165\u9884\u89c8\uff1a',
    `\u76ee\u6807\u6587\u4ef6\uff1a${summary.targetNotePath}`,
    `\u680f\u76ee\uff1a${summary.category}`,
    `\u6807\u7b7e\uff1a${summary.tags.join('\u3001') || '\u65e0'}`,
    `\u56fe\u7247\uff1a${summary.imageCount} \u4e2a`,
    '\u5c06\u65b0\u589e\u6216\u4fee\u6539\uff1a',
    ...summary.createdFiles.map((filePath) => `  - ${filePath}`)
  ].join('\n')
}

function startLocalPreview() {
  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'
  return spawn(npmCommand, ['run', 'docs:dev'], { cwd: process.cwd(), stdio: 'inherit' })
}

async function publishImport(result, metadata, { push, gitRunner }) {
  const gitPaths = [relative(process.cwd(), result.notePath), ...result.assetPaths.map((path) => relative(process.cwd(), path))]
  await gitRunner(['add', '--', ...gitPaths])
  await gitRunner(['commit', '-m', `docs: import ${metadata.title}`])
  if (push) await gitRunner(['push'])
}

export async function runInteractiveImport(sourcePath, {
  reader: suppliedReader,
  siteDir = resolve('site'),
  previewRunner = startLocalPreview,
  gitRunner = runGit
} = {}) {
  const resolvedSourcePath = resolve(sourcePath)
  const source = await readFile(resolvedSourcePath, 'utf8')
  const detected = detectText(resolvedSourcePath, source)
  const recommendation = recommendNoteMetadata(source)
  const reader = suppliedReader ?? createInterface({ input: process.stdin, output: process.stdout })
  const ownsReader = !suppliedReader

  try {
    console.log('\n\u5f00\u59cb\u5bfc\u5165\u7b14\u8bb0\u3002\u9664\u81ea\u5b9a\u4e49\u6807\u9898\u6216\u6458\u8981\u5916\uff0c\u6240\u6709\u8bbe\u7f6e\u5747\u4e3a\u7f16\u53f7\u9009\u62e9\u3002\n')
    const title = await chooseText(reader, '\u6807\u9898', detected.title)
    const description = await chooseText(reader, '\u6458\u8981', detected.description)
    const category = await chooseOne(reader, '\u6240\u5c5e\u680f\u76ee\uff08\u672c\u5730\u5206\u6790\u5df2\u5c06\u63a8\u8350\u9879\u6392\u5728\u9996\u4f4d\uff09', withRecommendedFirst(CATEGORY_OPTIONS, recommendation.category))
    const tags = await chooseRecommendedTags(reader, recommendation.tags)
    const difficulty = await chooseOne(reader, '\u96be\u5ea6', withRecommendedFirst(DIFFICULTY_OPTIONS, recommendation.difficulty))
    const date = await chooseDate(reader)
    const visibility = await chooseOne(reader, '\u7b14\u8bb0\u72b6\u6001', [
      { value: false, label: '\u516c\u5f00\u53d1\u5e03\uff08\u63a8\u8350\uff09' },
      { value: true, label: '\u4fdd\u5b58\u4e3a\u8349\u7a3f\uff0c\u4e0d\u51fa\u73b0\u5728\u516c\u5f00\u5bfc\u822a\u4e2d' },
      { value: 'scheduled', label: '\u5b9a\u65f6\u53d1\u5e03\uff0c\u5230\u6307\u5b9a\u65e5\u671f\u81ea\u52a8\u516c\u5f00' }
    ])
    const publishAt = visibility.value === 'scheduled' ? await chooseDate(reader) : ''
    const metadata = { title, description, category: category.value, tags, difficulty: difficulty.value, date, publishAt, draft: visibility.value === true }
    const plan = await createImportPlan({ sourcePath: resolvedSourcePath, siteDir, metadata, base: '/gitpagewebnote/' })
    const result = await writeImport(plan)
    const issues = await validateNotes({ siteDir })
    if (issues.length > 0) throw new Error(`\u7b14\u8bb0\u5df2\u5bfc\u5165\uff0c\u4f46\u5185\u5bb9\u6821\u9a8c\u5931\u8d25\uff1a\n${issues.map((issue) => `${issue.file}: ${issue.message}`).join('\n')}`)

    console.log(`\n\u5bfc\u5165\u6210\u529f\uff1a${result.notePath}`)
    console.log(formatImportSummary(summarizeImportPlan(plan)))
    const preview = await chooseOne(reader, '\u4e0b\u4e00\u6b65\uff1a\u662f\u5426\u542f\u52a8\u672c\u5730\u9884\u89c8\uff1f', [
      { value: 'preview', label: '\u542f\u52a8\u672c\u5730\u9884\u89c8\u540e\u518d\u51b3\u5b9a\u53d1\u5e03\uff08\u63a8\u8350\uff09' },
      { value: 'skip', label: '\u8df3\u8fc7\u9884\u89c8\uff0c\u7ee7\u7eed\u9009\u62e9\u662f\u5426\u63d0\u4ea4' }
    ])
    if (preview.value === 'preview') {
      const previewProcess = previewRunner()
      const previewAction = await chooseOne(reader, '\u672c\u5730\u9884\u89c8\u5df2\u542f\u52a8\u3002\u4e0b\u4e00\u6b65\uff1a', [
        { value: 'stop-and-continue', label: '\u505c\u6b62\u9884\u89c8\uff0c\u7ee7\u7eed\u9009\u62e9\u662f\u5426\u63d0\u4ea4' },
        { value: 'keep-local', label: '\u4fdd\u7559\u672c\u5730\u6587\u4ef6\uff0c\u7a0d\u540e\u624b\u52a8\u53d1\u5e03' }
      ])
      if (previewAction.value === 'keep-local') {
        console.log('\u5df2\u4fdd\u7559\u9884\u89c8\u670d\u52a1\u548c\u672c\u5730\u6587\u4ef6\uff1b\u672a\u6267\u884c Git \u64cd\u4f5c\u3002')
        return result
      }
      previewProcess.kill?.()
    }
    const commit = await chooseOne(reader, '\u68c0\u67e5\u5b8c\u6210\u540e\uff0c\u662f\u5426\u521b\u5efa Git \u63d0\u4ea4\uff1f', [
      { value: 'commit', label: '\u521b\u5efa Git \u63d0\u4ea4' },
      { value: 'local', label: '\u4ec5\u4fdd\u7559\u672c\u5730\u6587\u4ef6\uff08\u63a8\u8350\uff09' }
    ])
    if (commit.value === 'local') {
      console.log('\u6587\u4ef6\u5df2\u4fdd\u7559\u5728\u672c\u5730\u5de5\u4f5c\u533a\uff1b\u672a\u6267\u884c Git \u64cd\u4f5c\u3002')
      return result
    }
    const push = await chooseOne(reader, '\u63d0\u4ea4\u5b8c\u6210\u540e\uff0c\u662f\u5426\u7acb\u5373\u63a8\u9001\u5e76\u89e6\u53d1 GitHub Pages\uff1f', [
      { value: true, label: '\u63d0\u4ea4\u5e76\u63a8\u9001\u5230 GitHub Pages' },
      { value: false, label: '\u4ec5\u521b\u5efa\u672c\u5730 Git \u63d0\u4ea4' }
    ])
    await publishImport(result, metadata, { push: push.value, gitRunner })
    console.log(push.value ? '\u5df2\u63d0\u4ea4\u5e76\u63a8\u9001\u5230 GitHub\uff0cGitHub Pages \u5c06\u81ea\u52a8\u53d1\u5e03\u3002' : '\u5df2\u521b\u5efa Git \u63d0\u4ea4\uff1b\u7a0d\u540e\u8fd0\u884c git push \u5373\u53ef\u53d1\u5e03\u3002')
    return result
  } finally {
    if (ownsReader) reader.close()
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const sourcePath = process.argv[2]
  if (!sourcePath) {
    console.error('\u7528\u6cd5\uff1anpm run note:import -- <Markdown \u6587\u4ef6\u8def\u5f84>')
    process.exitCode = 1
  } else {
    runInteractiveImport(sourcePath).catch((error) => {
      console.error(`\n\u5bfc\u5165\u5931\u8d25\uff1a${error.message}`)
      process.exitCode = 1
    })
  }
}
