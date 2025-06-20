import type { Prisma } from '../../client';

import { z } from 'zod';
import { ContentStatusSchema } from './ContentStatusSchema';
import { ReviewTypeSchema } from './ReviewTypeSchema';
import { UserCreateNestedOneWithoutDeletedReviewsInputSchema } from './UserCreateNestedOneWithoutDeletedReviewsInputSchema';
import { UserCreateNestedOneWithoutReviewsInputSchema } from './UserCreateNestedOneWithoutReviewsInputSchema';
import { ProductCreateNestedOneWithoutReviewsInputSchema } from './ProductCreateNestedOneWithoutReviewsInputSchema';
import { MediaCreateNestedManyWithoutReviewInputSchema } from './MediaCreateNestedManyWithoutReviewInputSchema';

export const ReviewCreateWithoutVotesInputSchema: z.ZodType<Prisma.ReviewCreateWithoutVotesInput> = z.object({
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
  deletedBy: z.lazy(() => UserCreateNestedOneWithoutDeletedReviewsInputSchema).optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutReviewsInputSchema),
  product: z.lazy(() => ProductCreateNestedOneWithoutReviewsInputSchema).optional(),
  media: z.lazy(() => MediaCreateNestedManyWithoutReviewInputSchema).optional()
}).strict();

export default ReviewCreateWithoutVotesInputSchema;
