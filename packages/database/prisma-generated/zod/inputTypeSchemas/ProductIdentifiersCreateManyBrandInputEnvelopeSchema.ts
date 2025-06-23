import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductIdentifiersCreateManyBrandInputSchema } from './ProductIdentifiersCreateManyBrandInputSchema';

export const ProductIdentifiersCreateManyBrandInputEnvelopeSchema: z.ZodType<Prisma.ProductIdentifiersCreateManyBrandInputEnvelope> =
  z
    .object({
      data: z.union([
        z.lazy(() => ProductIdentifiersCreateManyBrandInputSchema),
        z.lazy(() => ProductIdentifiersCreateManyBrandInputSchema).array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default ProductIdentifiersCreateManyBrandInputEnvelopeSchema;
