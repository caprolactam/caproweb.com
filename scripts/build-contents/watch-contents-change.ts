import nodePath from 'node:path'
import chokidar from 'chokidar'
import closeWithGrace from 'close-with-grace'
import fg from 'fast-glob'
import { getMetadatas } from './get-metadata'
import { createSerializedMdx } from './serialize-mdx'

const watcher = chokidar.watch(await fg('contents/**/*.{md,mdx}'))

watcher.on('ready', () => {
  watcher.on('add', reloadContent)
  watcher.on('change', reloadContent)
})

async function reloadContent(path: string) {
  const filePaths = nodePath.join(process.cwd(), path)

  await Promise.all([createSerializedMdx(filePaths), getMetadatas()])

  console.log('Content reloaded:', path)
}

closeWithGrace(async (err) => {
  console.log('closing chokidar', err)
  await watcher.close()
})
