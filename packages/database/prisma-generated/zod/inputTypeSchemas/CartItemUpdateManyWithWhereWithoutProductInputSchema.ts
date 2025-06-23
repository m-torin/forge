import type { Prisma } from '../../client';

import { z } from 'zod';
import { CartItemScalarWhereInputSchema } from './CartItemScalarWhereInputSchema';
import { CartItemUpdateManyMutationInputSchema } from './CartItemUpdateManyMutationInputSchema';
import { CartItemUncheckedUpdateManyWithoutProductInputSchema } from './CartItemUncheckedUpdateManyWithoutProductInputSchema';

export const CartItemUpdateManyWithWhereWithoutProductInputSchema: z.ZodType<Prisma.CartItemUpdateManyWithWhereWithoutProductInput> =
  z
    .object({
      where: z.lazy(() => CartItemScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => CartItemUpdateManyMutationInputSchema),
        z.lazy(() => CartItemUncheckedUpdateManyWithoutProductInputSchema),
      ]),
    })
    .strict();

export default CartItemUpdateManyWithWhereWithoutProductInputSchema;
