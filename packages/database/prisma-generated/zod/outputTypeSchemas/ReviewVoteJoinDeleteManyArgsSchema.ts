import { z } from 'zod';
import type { Prisma } from '../../client';
import { ReviewVoteJoinWhereInputSchema } from '../inputTypeSchemas/ReviewVoteJoinWhereInputSchema';

export const ReviewVoteJoinDeleteManyArgsSchema: z.ZodType<Prisma.ReviewVoteJoinDeleteManyArgs> = z
  .object({
    where: ReviewVoteJoinWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export default ReviewVoteJoinDeleteManyArgsSchema;
