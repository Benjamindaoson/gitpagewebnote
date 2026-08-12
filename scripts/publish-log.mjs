import { execFile as execFileCallback } from 'node:child_process'
import { promisify } from 'node:util'

const execFile = promisify(execFileCallback)

export async function loadPublishLog({ repoDir = process.cwd(), limit = 30 } = {}) {
  try {
    const { stdout } = await execFile('git', ['log', `-n${limit}`, '--format=%H%x1f%cs%x1f%s%x1e'], { cwd: repoDir })
    return stdout.split('\x1e').filter(Boolean).map((line) => {
      const [hash, date, summary] = line.split('\x1f')
      return { hash, date, summary }
    })
  } catch {
    return []
  }
}
