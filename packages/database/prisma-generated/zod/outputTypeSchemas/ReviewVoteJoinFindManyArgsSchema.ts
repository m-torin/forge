import { z } from 'zod';
import type { Prisma } from '../../client';
import { ReviewVoteJoinIncludeSchema } from '../inputTypeSchemas/ReviewVoteJoinIncludeSchema'
import { ReviewVoteJoinWhereInputSchema } from '../inputTypeSchemas/ReviewVoteJoinWhereInputSchema'
import { ReviewVoteJoinOrderByWithRelationInputSchema } from '../inputTypeSchemas/ReviewVoteJoinOrderByWithRelationInputSchema'
import { ReviewVoteJoinWhereUniqueInputSchema } from '../inputTypeSchemas/ReviewVoteJoinWhereUniqueInputSchema'
import { ReviewVoteJoinScalarFieldEnumSchema } from '../inputTypeSchemas/ReviewVoteJoinScalarFieldEnumSchema'
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { ReviewArgsSchema } from "../outputTypeSchemas/ReviewArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const ReviewVoteJoinSelectSchema: z.ZodType<Prisma.ReviewVoteJoinSelect> = z.object({
  id: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  voteType: z.boolean().optional(),
  userId: z.boolean().optional(),
  reviewId: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  review: z.union([z.boolean(),z.lazy(() => ReviewArgsSchema)]).optional(),
}).strict()

export const ReviewVoteJoinFindManyArgsSchema: z.ZodType<Prisma.ReviewVoteJoinFindManyArgs> = z.object({
  select: ReviewVoteJoinSelectSchema.optional(),
  include: z.lazy(() => ReviewVoteJoinIncludeSchema).optional(),
  where: ReviewVoteJoinWhereInputSchema.optional(),
  orderBy: z.union([ ReviewVoteJoinOrderByWithRelationInputSchema.array(),ReviewVoteJoinOrderByWithRelationInputSchema ]).optional(),
  cursor: ReviewVoteJoinWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ ReviewVoteJoinScalarFieldEnumSchema,ReviewVoteJoinScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export default ReviewVoteJoinFindManyArgsSchema;
