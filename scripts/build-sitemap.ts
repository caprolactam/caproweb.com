import { writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getSitemapXml } from '@nasa-gcn/remix-seo/build/sitemap/utils.js'
import { type ServerBuild } from 'react-router'
// @ts-ignore - the file might not exist yet but it will
import * as build from '../build/server/index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const filePathForProd = path.join(
  __dirname,
  '..',
  'build',
  'client',
  'sitemap.xml',
)
const filePathForDev = path.join(__dirname, '..', 'public', 'sitemap.xml')

const sitemap = await getSitemapXml(
  new Request('https://dummy.local'),
  (build as unknown as ServerBuild).routes,
  {
    siteUrl: 'https://caproweb.com',
  },
)

await Promise.all(
  [filePathForProd, filePathForDev].map((path) => {
    return writeFile(path, sitemap, 'utf8')
  }),
).catch((e) => console.error(e))
