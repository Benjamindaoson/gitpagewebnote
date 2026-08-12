import { resolve } from 'node:path'
import { buildContentHealthReport } from './content-index.mjs'

const siteDir = resolve('site')
const health = await buildContentHealthReport({ siteDir })
console.log(JSON.stringify(health, null, 2))
