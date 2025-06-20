import { z } from 'zod';
import type { Prisma } from '../../client';
import { CartWhereInputSchema } from '../inputTypeSchemas/CartWhereInputSchema'
import { CartOrderByWithRelationInputSchema } from '../inputTypeSchemas/CartOrderByWithRelationInputSchema'
import { CartWhereUniqueInputSchema } from '../inputTypeSchemas/CartWhereUniqueInputSchema'

export const CartAggregateArgsSchema: z.ZodType<Prisma.CartAggregateArgs> = z.object({
  where: CartWhereInputSchema.optional(),
  orderBy: z.union([ CartOrderByWithRelationInputSchema.array(),CartOrderByWithRelationInputSchema ]).optional(),
  cursor: CartWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default CartAggregateArgsSchema;
