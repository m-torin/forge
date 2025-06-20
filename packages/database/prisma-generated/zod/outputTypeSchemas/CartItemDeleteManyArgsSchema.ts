import { z } from 'zod';
import type { Prisma } from '../../client';
import { CartItemWhereInputSchema } from '../inputTypeSchemas/CartItemWhereInputSchema'

export const CartItemDeleteManyArgsSchema: z.ZodType<Prisma.CartItemDeleteManyArgs> = z.object({
  where: CartItemWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default CartItemDeleteManyArgsSchema;
