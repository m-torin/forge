import type { Prisma } from '../../client';

import { z } from 'zod';
import { ContentStatusSchema } from './ContentStatusSchema';
import { ReviewTypeSchema } from './ReviewTypeSchema';
import { MediaUncheckedCreateNestedManyWithoutReviewInputSchema } from './MediaUncheckedCreateNestedManyWithoutReviewInputSchema';
import { ReviewVoteJoinUncheckedCreateNestedManyWithoutReviewInputSchema } from './ReviewVoteJoinUncheckedCreateNestedManyWithoutReviewInputSchema';

export const ReviewUncheckedCreateWithoutProductInputSchema: z.ZodType<Prisma.ReviewUncheckedCreateWithoutProductInput> =
  z
    .object({
      id: z.string().cuid().optional(),
      createdAt: z.coerce.date().optional(),
      updatedAt: z.coerce.date().optional(),
      deletedAt: z.coerce.date().optional().nullable(),
      deletedById: z.string().optional().nullable(),
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
      media: z.lazy(() => MediaUncheckedCreateNestedManyWithoutReviewInputSchema).optional(),
      votes: z
        .lazy(() => ReviewVoteJoinUncheckedCreateNestedManyWithoutReviewInputSchema)
        .optional(),
    })
    .strict();

export default ReviewUncheckedCreateWithoutProductInputSchema;
