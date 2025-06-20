import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateManyDeletedByInputSchema } from './ProductCreateManyDeletedByInputSchema';

export const ProductCreateManyDeletedByInputEnvelopeSchema: z.ZodType<Prisma.ProductCreateManyDeletedByInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ProductCreateManyDeletedByInputSchema),z.lazy(() => ProductCreateManyDeletedByInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default ProductCreateManyDeletedByInputEnvelopeSchema;
