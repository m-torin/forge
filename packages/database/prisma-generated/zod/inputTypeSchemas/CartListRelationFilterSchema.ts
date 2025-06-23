import type { Prisma } from '../../client';

import { z } from 'zod';
import { CartWhereInputSchema } from './CartWhereInputSchema';

export const CartListRelationFilterSchema: z.ZodType<Prisma.CartListRelationFilter> = z
  .object({
    every: z.lazy(() => CartWhereInputSchema).optional(),
    some: z.lazy(() => CartWhereInputSchema).optional(),
    none: z.lazy(() => CartWhereInputSchema).optional(),
  })
  .strict();

export default CartListRelationFilterSchema;
