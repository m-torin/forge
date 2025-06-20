import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewVoteJoinUserIdReviewIdCompoundUniqueInputSchema } from './ReviewVoteJoinUserIdReviewIdCompoundUniqueInputSchema';
import { ReviewVoteJoinWhereInputSchema } from './ReviewVoteJoinWhereInputSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { EnumVoteTypeFilterSchema } from './EnumVoteTypeFilterSchema';
import { VoteTypeSchema } from './VoteTypeSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { UserScalarRelationFilterSchema } from './UserScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { ReviewScalarRelationFilterSchema } from './ReviewScalarRelationFilterSchema';
import { ReviewWhereInputSchema } from './ReviewWhereInputSchema';

export const ReviewVoteJoinWhereUniqueInputSchema: z.ZodType<Prisma.ReviewVoteJoinWhereUniqueInput> = z.union([
  z.object({
    id: z.string().cuid(),
    userId_reviewId: z.lazy(() => ReviewVoteJoinUserIdReviewIdCompoundUniqueInputSchema)
  }),
  z.object({
    id: z.string().cuid(),
  }),
  z.object({
    userId_reviewId: z.lazy(() => ReviewVoteJoinUserIdReviewIdCompoundUniqueInputSchema),
  }),
])
.and(z.object({
  id: z.string().cuid().optional(),
  userId_reviewId: z.lazy(() => ReviewVoteJoinUserIdReviewIdCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => ReviewVoteJoinWhereInputSchema),z.lazy(() => ReviewVoteJoinWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => ReviewVoteJoinWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => ReviewVoteJoinWhereInputSchema),z.lazy(() => ReviewVoteJoinWhereInputSchema).array() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  voteType: z.union([ z.lazy(() => EnumVoteTypeFilterSchema),z.lazy(() => VoteTypeSchema) ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  reviewId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  review: z.union([ z.lazy(() => ReviewScalarRelationFilterSchema),z.lazy(() => ReviewWhereInputSchema) ]).optional(),
}).strict());

export default ReviewVoteJoinWhereUniqueInputSchema;
