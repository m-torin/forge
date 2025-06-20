import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCategoryCreateManyDeletedByInputSchema } from './ProductCategoryCreateManyDeletedByInputSchema';

export const ProductCategoryCreateManyDeletedByInputEnvelopeSchema: z.ZodType<Prisma.ProductCategoryCreateManyDeletedByInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ProductCategoryCreateManyDeletedByInputSchema),z.lazy(() => ProductCategoryCreateManyDeletedByInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default ProductCategoryCreateManyDeletedByInputEnvelopeSchema;
