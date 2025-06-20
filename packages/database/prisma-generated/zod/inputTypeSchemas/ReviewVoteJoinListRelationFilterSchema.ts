import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewVoteJoinWhereInputSchema } from './ReviewVoteJoinWhereInputSchema';

export const ReviewVoteJoinListRelationFilterSchema: z.ZodType<Prisma.ReviewVoteJoinListRelationFilter> = z.object({
  every: z.lazy(() => ReviewVoteJoinWhereInputSchema).optional(),
  some: z.lazy(() => ReviewVoteJoinWhereInputSchema).optional(),
  none: z.lazy(() => ReviewVoteJoinWhereInputSchema).optional()
}).strict();

export default ReviewVoteJoinListRelationFilterSchema;
