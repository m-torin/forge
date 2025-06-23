import { z } from 'zod';
import type { Prisma } from '../../client';
import { CartItemUpdateManyMutationInputSchema } from '../inputTypeSchemas/CartItemUpdateManyMutationInputSchema';
import { CartItemUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/CartItemUncheckedUpdateManyInputSchema';
import { CartItemWhereInputSchema } from '../inputTypeSchemas/CartItemWhereInputSchema';

export const CartItemUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.CartItemUpdateManyAndReturnArgs> =
  z
    .object({
      data: z.union([
        CartItemUpdateManyMutationInputSchema,
        CartItemUncheckedUpdateManyInputSchema,
      ]),
      where: CartItemWhereInputSchema.optional(),
      limit: z.number().optional(),
    })
    .strict();

export default CartItemUpdateManyAndReturnArgsSchema;
