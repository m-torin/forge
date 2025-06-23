import type { Prisma } from '../../client';

import { z } from 'zod';
import { SeriesCreateManyFandomInputSchema } from './SeriesCreateManyFandomInputSchema';

export const SeriesCreateManyFandomInputEnvelopeSchema: z.ZodType<Prisma.SeriesCreateManyFandomInputEnvelope> =
  z
    .object({
      data: z.union([
        z.lazy(() => SeriesCreateManyFandomInputSchema),
        z.lazy(() => SeriesCreateManyFandomInputSchema).array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default SeriesCreateManyFandomInputEnvelopeSchema;
