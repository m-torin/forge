import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductIdentifiersCreateManyPdpJoinInputSchema } from './ProductIdentifiersCreateManyPdpJoinInputSchema';

export const ProductIdentifiersCreateManyPdpJoinInputEnvelopeSchema: z.ZodType<Prisma.ProductIdentifiersCreateManyPdpJoinInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => ProductIdentifiersCreateManyPdpJoinInputSchema),z.lazy(() => ProductIdentifiersCreateManyPdpJoinInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default ProductIdentifiersCreateManyPdpJoinInputEnvelopeSchema;
