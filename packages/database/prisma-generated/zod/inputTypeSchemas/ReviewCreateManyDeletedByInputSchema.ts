import type { Prisma } from '../../client';

import { z } from 'zod';
import { ContentStatusSchema } from './ContentStatusSchema';
import { ReviewTypeSchema } from './ReviewTypeSchema';

export const ReviewCreateManyDeletedByInputSchema: z.ZodType<Prisma.ReviewCreateManyDeletedByInput> = z.object({
  id: z.string().cuid().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  title: z.string().optional().nullable(),
  content: z.string(),
  rating: z.number().int(),
  status: z.lazy(() => ContentStatusSchema).optional(),
  verified: z.boolean().optional(),
  type: z.lazy(() => ReviewTypeSchema).optional(),
  sourceId: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  helpfulCount: z.number().int().optional(),
  totalVotes: z.number().int().optional(),
  userId: z.string(),
  productId: z.string().optional().nullable()
}).strict();

export default ReviewCreateManyDeletedByInputSchema;
