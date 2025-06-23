import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaCreateManyReviewInputSchema } from './MediaCreateManyReviewInputSchema';

export const MediaCreateManyReviewInputEnvelopeSchema: z.ZodType<Prisma.MediaCreateManyReviewInputEnvelope> =
  z
    .object({
      data: z.union([
        z.lazy(() => MediaCreateManyReviewInputSchema),
        z.lazy(() => MediaCreateManyReviewInputSchema).array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default MediaCreateManyReviewInputEnvelopeSchema;
