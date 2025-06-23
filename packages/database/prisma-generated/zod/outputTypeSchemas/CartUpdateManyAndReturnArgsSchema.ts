import { z } from 'zod';
import type { Prisma } from '../../client';
import { CartUpdateManyMutationInputSchema } from '../inputTypeSchemas/CartUpdateManyMutationInputSchema';
import { CartUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/CartUncheckedUpdateManyInputSchema';
import { CartWhereInputSchema } from '../inputTypeSchemas/CartWhereInputSchema';

export const CartUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.CartUpdateManyAndReturnArgs> = z
  .object({
    data: z.union([CartUpdateManyMutationInputSchema, CartUncheckedUpdateManyInputSchema]),
    where: CartWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export default CartUpdateManyAndReturnArgsSchema;
