import { z } from 'zod';
import type { Prisma } from '../../client';
import { CartCreateManyInputSchema } from '../inputTypeSchemas/CartCreateManyInputSchema'

export const CartCreateManyAndReturnArgsSchema: z.ZodType<Prisma.CartCreateManyAndReturnArgs> = z.object({
  data: z.union([ CartCreateManyInputSchema,CartCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default CartCreateManyAndReturnArgsSchema;
