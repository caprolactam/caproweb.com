export function filterPublishedPosts<T extends { draft: boolean }>(
  posts: Array<T>,
) {
  return posts.filter((post) => !post.draft)
}

export const filterPostsByKeywords =
  (keywords: Array<string>) =>
  <T extends { keywords: Array<string> }>(posts: Array<T>) => {
    if (!keywords.length) return posts

    return posts.filter((post) =>
      keywords.every((keyword) => post.keywords.includes(keyword)),
    )
  }

export function sortPostsByLatest<T extends { createdAt: Date }>(
  posts: Array<T>,
) {
  return posts.sort((a, b) => {
    const aTime = a.createdAt.getTime()
    const bTime = b.createdAt.getTime()
    return aTime > bTime ? -1 : aTime === bTime ? 0 : 1
  })
}

export const paginatePosts =
  ({ skip, take }: { skip: number; take: number }) =>
  <T>(posts: Array<T>) => {
    return posts.slice(skip, skip + take)
  }
