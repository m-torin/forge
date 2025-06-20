import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { ReviewVoteJoinCountOrderByAggregateInputSchema } from './ReviewVoteJoinCountOrderByAggregateInputSchema';
import { ReviewVoteJoinMaxOrderByAggregateInputSchema } from './ReviewVoteJoinMaxOrderByAggregateInputSchema';
import { ReviewVoteJoinMinOrderByAggregateInputSchema } from './ReviewVoteJoinMinOrderByAggregateInputSchema';

export const ReviewVoteJoinOrderByWithAggregationInputSchema: z.ZodType<Prisma.ReviewVoteJoinOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  voteType: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  reviewId: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => ReviewVoteJoinCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => ReviewVoteJoinMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => ReviewVoteJoinMinOrderByAggregateInputSchema).optional()
}).strict();

export default ReviewVoteJoinOrderByWithAggregationInputSchema;
