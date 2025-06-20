import type { Prisma } from '../../client';

import { z } from 'zod';

export const ProductUpdateaiSourcesInputSchema: z.ZodType<Prisma.ProductUpdateaiSourcesInput> = z.object({
  set: z.string().array().optional(),
  push: z.union([ z.string(),z.string().array() ]).optional(),
}).strict();

export default ProductUpdateaiSourcesInputSchema;
