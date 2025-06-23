import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductIdentifiersCreateManyCollectionInputSchema } from './ProductIdentifiersCreateManyCollectionInputSchema';

export const ProductIdentifiersCreateManyCollectionInputEnvelopeSchema: z.ZodType<Prisma.ProductIdentifiersCreateManyCollectionInputEnvelope> =
  z
    .object({
      data: z.union([
        z.lazy(() => ProductIdentifiersCreateManyCollectionInputSchema),
        z.lazy(() => ProductIdentifiersCreateManyCollectionInputSchema).array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default ProductIdentifiersCreateManyCollectionInputEnvelopeSchema;
