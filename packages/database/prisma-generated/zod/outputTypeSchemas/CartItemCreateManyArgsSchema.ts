import { z } from 'zod';
import type { Prisma } from '../../client';
import { CartItemCreateManyInputSchema } from '../inputTypeSchemas/CartItemCreateManyInputSchema'

export const CartItemCreateManyArgsSchema: z.ZodType<Prisma.CartItemCreateManyArgs> = z.object({
  data: z.union([ CartItemCreateManyInputSchema,CartItemCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default CartItemCreateManyArgsSchema;
