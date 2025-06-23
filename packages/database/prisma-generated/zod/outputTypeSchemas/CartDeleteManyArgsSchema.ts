import { z } from 'zod';
import type { Prisma } from '../../client';
import { CartWhereInputSchema } from '../inputTypeSchemas/CartWhereInputSchema';

export const CartDeleteManyArgsSchema: z.ZodType<Prisma.CartDeleteManyArgs> = z
  .object({
    where: CartWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export default CartDeleteManyArgsSchema;
