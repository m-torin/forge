import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandCreateManyDeletedByInputSchema } from './BrandCreateManyDeletedByInputSchema';

export const BrandCreateManyDeletedByInputEnvelopeSchema: z.ZodType<Prisma.BrandCreateManyDeletedByInputEnvelope> =
  z
    .object({
      data: z.union([
        z.lazy(() => BrandCreateManyDeletedByInputSchema),
        z.lazy(() => BrandCreateManyDeletedByInputSchema).array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default BrandCreateManyDeletedByInputEnvelopeSchema;
