import type { Prisma } from '../../client';

import { z } from 'zod';
import { TaxonomyCreateManyDeletedByInputSchema } from './TaxonomyCreateManyDeletedByInputSchema';

export const TaxonomyCreateManyDeletedByInputEnvelopeSchema: z.ZodType<Prisma.TaxonomyCreateManyDeletedByInputEnvelope> =
  z
    .object({
      data: z.union([
        z.lazy(() => TaxonomyCreateManyDeletedByInputSchema),
        z.lazy(() => TaxonomyCreateManyDeletedByInputSchema).array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default TaxonomyCreateManyDeletedByInputEnvelopeSchema;
