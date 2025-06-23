import type { Prisma } from '../../client';

import { z } from 'zod';
import { CartItemCreateManyVariantInputSchema } from './CartItemCreateManyVariantInputSchema';

export const CartItemCreateManyVariantInputEnvelopeSchema: z.ZodType<Prisma.CartItemCreateManyVariantInputEnvelope> =
  z
    .object({
      data: z.union([
        z.lazy(() => CartItemCreateManyVariantInputSchema),
        z.lazy(() => CartItemCreateManyVariantInputSchema).array(),
      ]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default CartItemCreateManyVariantInputEnvelopeSchema;
