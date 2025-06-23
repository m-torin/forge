import { z } from 'zod';
import type { Prisma } from '../../client';
import { CartItemCreateManyInputSchema } from '../inputTypeSchemas/CartItemCreateManyInputSchema';

export const CartItemCreateManyAndReturnArgsSchema: z.ZodType<Prisma.CartItemCreateManyAndReturnArgs> =
  z
    .object({
      data: z.union([CartItemCreateManyInputSchema, CartItemCreateManyInputSchema.array()]),
      skipDuplicates: z.boolean().optional(),
    })
    .strict();

export default CartItemCreateManyAndReturnArgsSchema;
