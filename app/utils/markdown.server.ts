import { z } from 'zod'

export const frontmatterSchema = z.object({
  title: z.string(),
  description: z.string(),
  keywords: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().optional(),
})

export type Frontmatter = z.infer<typeof frontmatterSchema>

export const metadataSchema = frontmatterSchema.extend({
  fileNameWithoutExt: z.string(),
})
export const metadataListSchema = z.array(metadataSchema)

export type Metadata = z.infer<typeof metadataSchema>
