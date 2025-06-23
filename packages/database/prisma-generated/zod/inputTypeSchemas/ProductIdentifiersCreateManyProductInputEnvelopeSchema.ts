import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductIdentifiersCreateManyProductInputSchema } from './ProductIdentifiersCreateManyProductInputSchema';

export const ProductIdentifiersCreateManyProductInputEnvelopeSchema: z.ZodType<Prisma.ProductIdentifiersCreateManyProductInputEnvelope> =
  z
    .object({
      data: z.union([
        z.lazy(() => ProductIdentifiersCreateManyProductInputSchema),
        z.lazy(() => ProductIdentifiersCreateManyProductInputSchema).array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default ProductIdentifiersCreateManyProductInputEnvelopeSchema;
