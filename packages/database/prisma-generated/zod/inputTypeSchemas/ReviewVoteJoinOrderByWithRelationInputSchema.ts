import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { UserOrderByWithRelationInputSchema } from './UserOrderByWithRelationInputSchema';
import { ReviewOrderByWithRelationInputSchema } from './ReviewOrderByWithRelationInputSchema';

export const ReviewVoteJoinOrderByWithRelationInputSchema: z.ZodType<Prisma.ReviewVoteJoinOrderByWithRelationInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
      voteType: z.lazy(() => SortOrderSchema).optional(),
      userId: z.lazy(() => SortOrderSchema).optional(),
      reviewId: z.lazy(() => SortOrderSchema).optional(),
      user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
      review: z.lazy(() => ReviewOrderByWithRelationInputSchema).optional(),
    })
    .strict();

export default ReviewVoteJoinOrderByWithRelationInputSchema;
