import { z } from 'zod';
import type { Prisma } from '../../client';
import { CartItemSelectSchema } from '../inputTypeSchemas/CartItemSelectSchema';
import { CartItemIncludeSchema } from '../inputTypeSchemas/CartItemIncludeSchema';

export const CartItemArgsSchema: z.ZodType<Prisma.CartItemDefaultArgs> = z.object({
  select: z.lazy(() => CartItemSelectSchema).optional(),
  include: z.lazy(() => CartItemIncludeSchema).optional(),
}).strict();

export default CartItemArgsSchema;
