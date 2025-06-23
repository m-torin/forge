import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCategoryCreateManyParentInputSchema } from './ProductCategoryCreateManyParentInputSchema';

export const ProductCategoryCreateManyParentInputEnvelopeSchema: z.ZodType<Prisma.ProductCategoryCreateManyParentInputEnvelope> =
  z
    .object({
      data: z.union([
        z.lazy(() => ProductCategoryCreateManyParentInputSchema),
        z.lazy(() => ProductCategoryCreateManyParentInputSchema).array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default ProductCategoryCreateManyParentInputEnvelopeSchema;
