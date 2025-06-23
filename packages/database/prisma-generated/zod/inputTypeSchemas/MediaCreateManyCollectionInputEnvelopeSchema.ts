import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaCreateManyCollectionInputSchema } from './MediaCreateManyCollectionInputSchema';

export const MediaCreateManyCollectionInputEnvelopeSchema: z.ZodType<Prisma.MediaCreateManyCollectionInputEnvelope> =
  z
    .object({
      data: z.union([
        z.lazy(() => MediaCreateManyCollectionInputSchema),
        z.lazy(() => MediaCreateManyCollectionInputSchema).array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default MediaCreateManyCollectionInputEnvelopeSchema;
