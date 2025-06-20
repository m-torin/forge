import type { Prisma } from '../../client';

import { z } from 'zod';
import { CartItemCreateManyProductInputSchema } from './CartItemCreateManyProductInputSchema';

export const CartItemCreateManyProductInputEnvelopeSchema: z.ZodType<Prisma.CartItemCreateManyProductInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => CartItemCreateManyProductInputSchema),z.lazy(() => CartItemCreateManyProductInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default CartItemCreateManyProductInputEnvelopeSchema;
