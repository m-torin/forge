import { z } from 'zod';
import type { Prisma } from '../../client';
import { ReviewVoteJoinCreateManyInputSchema } from '../inputTypeSchemas/ReviewVoteJoinCreateManyInputSchema'

export const ReviewVoteJoinCreateManyAndReturnArgsSchema: z.ZodType<Prisma.ReviewVoteJoinCreateManyAndReturnArgs> = z.object({
  data: z.union([ ReviewVoteJoinCreateManyInputSchema,ReviewVoteJoinCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default ReviewVoteJoinCreateManyAndReturnArgsSchema;
