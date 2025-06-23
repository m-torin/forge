import type { Prisma } from '../../client';

import { z } from 'zod';
import { CartItemCreateManyRegistryInputSchema } from './CartItemCreateManyRegistryInputSchema';

export const CartItemCreateManyRegistryInputEnvelopeSchema: z.ZodType<Prisma.CartItemCreateManyRegistryInputEnvelope> =
  z
    .object({
      data: z.union([
        z.lazy(() => CartItemCreateManyRegistryInputSchema),
        z.lazy(() => CartItemCreateManyRegistryInputSchema).array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default CartItemCreateManyRegistryInputEnvelopeSchema;
