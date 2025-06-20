import { z } from 'zod';
import { ContentStatusSchema } from '../inputTypeSchemas/ContentStatusSchema'
import { ReviewTypeSchema } from '../inputTypeSchemas/ReviewTypeSchema'

/////////////////////////////////////////
// REVIEW SCHEMA
/////////////////////////////////////////

export const ReviewSchema = z.object({
  status: ContentStatusSchema,
  type: ReviewTypeSchema,
  id: z.string().cuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  deletedById: z.string().nullable(),
  title: z.string().nullable(),
  content: z.string(),
  rating: z.number().int(),
  verified: z.boolean(),
  sourceId: z.string().nullable(),
  source: z.string().nullable(),
  helpfulCount: z.number().int(),
  totalVotes: z.number().int(),
  userId: z.string(),
  productId: z.string().nullable(),
})

export type Review = z.infer<typeof ReviewSchema>

export default ReviewSchema;
