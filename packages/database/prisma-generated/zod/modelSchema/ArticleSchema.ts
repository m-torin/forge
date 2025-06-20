import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema'
import { ContentStatusSchema } from '../inputTypeSchemas/ContentStatusSchema'

/////////////////////////////////////////
// ARTICLE SCHEMA
/////////////////////////////////////////

export const ArticleSchema = z.object({
  status: ContentStatusSchema,
  id: z.string().cuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  deletedById: z.string().nullable(),
  title: z.string(),
  slug: z.string(),
  content: JsonValueSchema,
  userId: z.string().nullable(),
})

export type Article = z.infer<typeof ArticleSchema>

export default ArticleSchema;
