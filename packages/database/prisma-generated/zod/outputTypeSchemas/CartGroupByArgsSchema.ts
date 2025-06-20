import { z } from 'zod';
import type { Prisma } from '../../client';
import { CartWhereInputSchema } from '../inputTypeSchemas/CartWhereInputSchema'
import { CartOrderByWithAggregationInputSchema } from '../inputTypeSchemas/CartOrderByWithAggregationInputSchema'
import { CartScalarFieldEnumSchema } from '../inputTypeSchemas/CartScalarFieldEnumSchema'
import { CartScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/CartScalarWhereWithAggregatesInputSchema'

export const CartGroupByArgsSchema: z.ZodType<Prisma.CartGroupByArgs> = z.object({
  where: CartWhereInputSchema.optional(),
  orderBy: z.union([ CartOrderByWithAggregationInputSchema.array(),CartOrderByWithAggregationInputSchema ]).optional(),
  by: CartScalarFieldEnumSchema.array(),
  having: CartScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default CartGroupByArgsSchema;
