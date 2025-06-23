import { z } from 'zod';
import type { Prisma } from '../../client';
import { UserArgsSchema } from '../outputTypeSchemas/UserArgsSchema';
import { ReviewArgsSchema } from '../outputTypeSchemas/ReviewArgsSchema';

export const ReviewVoteJoinSelectSchema: z.ZodType<Prisma.ReviewVoteJoinSelect> = z
  .object({
    id: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    voteType: z.boolean().optional(),
    userId: z.boolean().optional(),
    reviewId: z.boolean().optional(),
    user: z.union([z.boolean(), z.lazy(() => UserArgsSchema)]).optional(),
    review: z.union([z.boolean(), z.lazy(() => ReviewArgsSchema)]).optional(),
  })
  .strict();

export default ReviewVoteJoinSelectSchema;
