import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { EnumVoteTypeFilterSchema } from './EnumVoteTypeFilterSchema';
import { VoteTypeSchema } from './VoteTypeSchema';

export const ReviewVoteJoinScalarWhereInputSchema: z.ZodType<Prisma.ReviewVoteJoinScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => ReviewVoteJoinScalarWhereInputSchema),z.lazy(() => ReviewVoteJoinScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ReviewVoteJoinScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ReviewVoteJoinScalarWhereInputSchema),z.lazy(() => ReviewVoteJoinScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  voteType: z.union([ z.lazy(() => EnumVoteTypeFilterSchema),z.lazy(() => VoteTypeSchema) ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  reviewId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
}).strict();

export default ReviewVoteJoinScalarWhereInputSchema;
