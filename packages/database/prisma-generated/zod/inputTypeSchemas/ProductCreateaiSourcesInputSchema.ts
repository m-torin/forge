import type { Prisma } from '../../client';

import { z } from 'zod';

export const ProductCreateaiSourcesInputSchema: z.ZodType<Prisma.ProductCreateaiSourcesInput> = z.object({
  set: z.string().array()
}).strict();

export default ProductCreateaiSourcesInputSchema;
