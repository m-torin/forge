import { z } from 'zod';
import type { Prisma } from '../../client';
import { CartItemWhereInputSchema } from '../inputTypeSchemas/CartItemWhereInputSchema';
import { CartItemOrderByWithRelationInputSchema } from '../inputTypeSchemas/CartItemOrderByWithRelationInputSchema';
import { CartItemWhereUniqueInputSchema } from '../inputTypeSchemas/CartItemWhereUniqueInputSchema';

export const CartItemAggregateArgsSchema: z.ZodType<Prisma.CartItemAggregateArgs> = z
  .object({
    where: CartItemWhereInputSchema.optional(),
    orderBy: z
      .union([
        CartItemOrderByWithRelationInputSchema.array(),
        CartItemOrderByWithRelationInputSchema,
      ])
      .optional(),
    cursor: CartItemWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export default CartItemAggregateArgsSchema;
