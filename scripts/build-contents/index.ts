import fg from 'fast-glob'
import { getMetadatas } from './get-metadata'
import { createSerializedMdx } from './serialize-mdx'

async function listContentPaths() {
  const filePaths = await fg('contents/**/*.{md,mdx}')

  await Promise.all(
    filePaths.map(async (filePath) => {
      try {
        await createSerializedMdx(filePath)
      } catch (error) {
        console.error(error)
      }
    }),
  )
}

await Promise.all([listContentPaths(), getMetadatas()]).catch((e) =>
  console.error(e),
)
