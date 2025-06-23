import { z } from 'zod';
import type { Prisma } from '../../client';
import { CartItemWhereInputSchema } from '../inputTypeSchemas/CartItemWhereInputSchema';
import { CartItemOrderByWithAggregationInputSchema } from '../inputTypeSchemas/CartItemOrderByWithAggregationInputSchema';
import { CartItemScalarFieldEnumSchema } from '../inputTypeSchemas/CartItemScalarFieldEnumSchema';
import { CartItemScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/CartItemScalarWhereWithAggregatesInputSchema';

export const CartItemGroupByArgsSchema: z.ZodType<Prisma.CartItemGroupByArgs> = z
  .object({
    where: CartItemWhereInputSchema.optional(),
    orderBy: z
      .union([
        CartItemOrderByWithAggregationInputSchema.array(),
        CartItemOrderByWithAggregationInputSchema,
      ])
      .optional(),
    by: CartItemScalarFieldEnumSchema.array(),
    having: CartItemScalarWhereWithAggregatesInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
  })
  .strict();

export default CartItemGroupByArgsSchema;
