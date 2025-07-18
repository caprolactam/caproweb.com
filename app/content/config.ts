import { z, defineCollection } from 'astro:content'

const postCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.date(),
    updatedAt: z.date().optional(),
    tags: z.array(z.string()).optional().default([]),
    image: z.string().optional(),
    isDraft: z.boolean(),
  }),
})

export const collections = {
  posts: postCollection,
}
