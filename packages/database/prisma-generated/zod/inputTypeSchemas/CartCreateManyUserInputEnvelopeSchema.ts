import type { Prisma } from '../../client';

import { z } from 'zod';
import { CartCreateManyUserInputSchema } from './CartCreateManyUserInputSchema';

export const CartCreateManyUserInputEnvelopeSchema: z.ZodType<Prisma.CartCreateManyUserInputEnvelope> = z.object({
  data: z.union([ z.lazy(() => CartCreateManyUserInputSchema),z.lazy(() => CartCreateManyUserInputSchema).array() ]),
  skipDuplicates: z.boolean().optional()
}).strict();

export default CartCreateManyUserInputEnvelopeSchema;
