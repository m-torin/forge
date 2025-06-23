import type { Prisma } from '../../client';

import { z } from 'zod';
import { CartWhereInputSchema } from './CartWhereInputSchema';
import { CartUpdateWithoutItemsInputSchema } from './CartUpdateWithoutItemsInputSchema';
import { CartUncheckedUpdateWithoutItemsInputSchema } from './CartUncheckedUpdateWithoutItemsInputSchema';

export const CartUpdateToOneWithWhereWithoutItemsInputSchema: z.ZodType<Prisma.CartUpdateToOneWithWhereWithoutItemsInput> =
  z
    .object({
      where: z.lazy(() => CartWhereInputSchema).optional(),
      data: z.union([
        z.lazy(() => CartUpdateWithoutItemsInputSchema),
        z.lazy(() => CartUncheckedUpdateWithoutItemsInputSchema),
      ]),
    })
    .strict();

export default CartUpdateToOneWithWhereWithoutItemsInputSchema;
