import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const ReviewVoteJoinMaxOrderByAggregateInputSchema: z.ZodType<Prisma.ReviewVoteJoinMaxOrderByAggregateInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
      voteType: z.lazy(() => SortOrderSchema).optional(),
      userId: z.lazy(() => SortOrderSchema).optional(),
      reviewId: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export default ReviewVoteJoinMaxOrderByAggregateInputSchema;
