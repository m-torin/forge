import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewCreateManyUserInputSchema } from './ReviewCreateManyUserInputSchema';

export const ReviewCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.ReviewCreateManyUserInputEnvelope> =
  z
    .object({
      data: z.union([
        z.lazy(() => ReviewCreateManyUserInputSchema),
        z.lazy(() => ReviewCreateManyUserInputSchema).array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default ReviewCreateManyUserInputEnvelopeSchema;
