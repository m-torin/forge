import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaCreateManyTaxonomyInputSchema } from './MediaCreateManyTaxonomyInputSchema';

export const MediaCreateManyTaxonomyInputEnvelopeSchema: z.ZodType<Prisma.MediaCreateManyTaxonomyInputEnvelope> =
  z
    .object({
      data: z.union([
        z.lazy(() => MediaCreateManyTaxonomyInputSchema),
        z.lazy(() => MediaCreateManyTaxonomyInputSchema).array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default MediaCreateManyTaxonomyInputEnvelopeSchema;
