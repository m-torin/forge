import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewCreateManyDeletedByInputSchema } from './ReviewCreateManyDeletedByInputSchema';

export const ReviewCreateManyDeletedByInputEnvelopeSchema: z.ZodType<Prisma.ReviewCreateManyDeletedByInputEnvelope> =
  z
    .object({
      data: z.union([
        z.lazy(() => ReviewCreateManyDeletedByInputSchema),
        z.lazy(() => ReviewCreateManyDeletedByInputSchema).array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default ReviewCreateManyDeletedByInputEnvelopeSchema;
