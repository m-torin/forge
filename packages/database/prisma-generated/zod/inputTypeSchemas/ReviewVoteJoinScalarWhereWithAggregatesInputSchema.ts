import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { DateTimeWithAggregatesFilterSchema } from './DateTimeWithAggregatesFilterSchema';
import { EnumVoteTypeWithAggregatesFilterSchema } from './EnumVoteTypeWithAggregatesFilterSchema';
import { VoteTypeSchema } from './VoteTypeSchema';

export const ReviewVoteJoinScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.ReviewVoteJoinScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => ReviewVoteJoinScalarWhereWithAggregatesInputSchema),z.lazy(() => ReviewVoteJoinScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => ReviewVoteJoinScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ReviewVoteJoinScalarWhereWithAggregatesInputSchema),z.lazy(() => ReviewVoteJoinScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  voteType: z.union([ z.lazy(() => EnumVoteTypeWithAggregatesFilterSchema),z.lazy(() => VoteTypeSchema) ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  reviewId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
}).strict();

export default ReviewVoteJoinScalarWhereWithAggregatesInputSchema;
