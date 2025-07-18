import { getCollection } from 'astro:content'

export async function listSortedContents() {
  const allContents = await getCollection('posts', ({ data }) => {
    return import.meta.env.PROD ? data.isDraft !== true : true
  })

  const sortedContents = allContents.sort((a, b) => {
    const former = new Date(a.data.publishedAt).getTime()
    const latter = new Date(b.data.publishedAt).getTime()

    return latter - former
  })

  return sortedContents
}
