import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaCreateManyDeletedByInputSchema } from './MediaCreateManyDeletedByInputSchema';

export const MediaCreateManyDeletedByInputEnvelopeSchema: z.ZodType<Prisma.MediaCreateManyDeletedByInputEnvelope> =
  z
    .object({
      data: z.union([
        z.lazy(() => MediaCreateManyDeletedByInputSchema),
        z.lazy(() => MediaCreateManyDeletedByInputSchema).array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default MediaCreateManyDeletedByInputEnvelopeSchema;
