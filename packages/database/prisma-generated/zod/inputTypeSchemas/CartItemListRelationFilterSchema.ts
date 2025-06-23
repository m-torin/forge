import type { Prisma } from '../../client';

import { z } from 'zod';
import { CartItemWhereInputSchema } from './CartItemWhereInputSchema';

export const CartItemListRelationFilterSchema: z.ZodType<Prisma.CartItemListRelationFilter> = z
  .object({
    every: z.lazy(() => CartItemWhereInputSchema).optional(),
    some: z.lazy(() => CartItemWhereInputSchema).optional(),
    none: z.lazy(() => CartItemWhereInputSchema).optional(),
  })
  .strict();

export default CartItemListRelationFilterSchema;
