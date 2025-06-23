import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewVoteJoinCreateManyUserInputSchema } from './ReviewVoteJoinCreateManyUserInputSchema';

export const ReviewVoteJoinCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.ReviewVoteJoinCreateManyUserInputEnvelope> =
  z
    .object({
      data: z.union([
        z.lazy(() => ReviewVoteJoinCreateManyUserInputSchema),
        z.lazy(() => ReviewVoteJoinCreateManyUserInputSchema).array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default ReviewVoteJoinCreateManyUserInputEnvelopeSchema;
