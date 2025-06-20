import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductCreateManyParentInputSchema } from './ProductCreateManyParentInputSchema';

export const ProductCreateManyParentInputEnvelopeSchema: z.ZodType<Prisma.ProductCreateManyParentInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ProductCreateManyParentInputSchema),z.lazy(() => ProductCreateManyParentInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default ProductCreateManyParentInputEnvelopeSchema;
