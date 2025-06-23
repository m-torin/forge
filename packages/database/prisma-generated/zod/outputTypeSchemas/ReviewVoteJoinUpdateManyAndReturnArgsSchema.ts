import { z } from 'zod';
import type { Prisma } from '../../client';
import { ReviewVoteJoinUpdateManyMutationInputSchema } from '../inputTypeSchemas/ReviewVoteJoinUpdateManyMutationInputSchema';
import { ReviewVoteJoinUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/ReviewVoteJoinUncheckedUpdateManyInputSchema';
import { ReviewVoteJoinWhereInputSchema } from '../inputTypeSchemas/ReviewVoteJoinWhereInputSchema';

export const ReviewVoteJoinUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.ReviewVoteJoinUpdateManyAndReturnArgs> =
  z
    .object({
      data: z.union([
        ReviewVoteJoinUpdateManyMutationInputSchema,
        ReviewVoteJoinUncheckedUpdateManyInputSchema,
      ]),
      where: ReviewVoteJoinWhereInputSchema.optional(),
      limit: z.number().optional(),
    })
    .strict();

export default ReviewVoteJoinUpdateManyAndReturnArgsSchema;
