import { z } from 'zod';
import type { Prisma } from '../../client';
import { ReviewVoteJoinSelectSchema } from '../inputTypeSchemas/ReviewVoteJoinSelectSchema';
import { ReviewVoteJoinIncludeSchema } from '../inputTypeSchemas/ReviewVoteJoinIncludeSchema';

export const ReviewVoteJoinArgsSchema: z.ZodType<Prisma.ReviewVoteJoinDefaultArgs> = z.object({
  select: z.lazy(() => ReviewVoteJoinSelectSchema).optional(),
  include: z.lazy(() => ReviewVoteJoinIncludeSchema).optional(),
}).strict();

export default ReviewVoteJoinArgsSchema;
