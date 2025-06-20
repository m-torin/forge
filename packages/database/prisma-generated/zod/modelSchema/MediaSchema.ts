import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema'
import { MediaTypeSchema } from '../inputTypeSchemas/MediaTypeSchema'

/////////////////////////////////////////
// MEDIA SCHEMA
/////////////////////////////////////////

export const MediaSchema = z.object({
  type: MediaTypeSchema,
  id: z.string().cuid(),
  url: z.string(),
  altText: z.string().nullable(),
  width: z.number().int().nullable(),
  height: z.number().int().nullable(),
  size: z.number().int().nullable(),
  mimeType: z.string().nullable(),
  sortOrder: z.number().int(),
  userId: z.string().nullable(),
  copy: JsonValueSchema,
  articleId: z.string().nullable(),
  brandId: z.string().nullable(),
  collectionId: z.string().nullable(),
  productId: z.string().nullable(),
  taxonomyId: z.string().nullable(),
  categoryId: z.string().nullable(),
  pdpJoinId: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  deletedById: z.string().nullable(),
  reviewId: z.string().nullable(),
})

export type Media = z.infer<typeof MediaSchema>

export default MediaSchema;
