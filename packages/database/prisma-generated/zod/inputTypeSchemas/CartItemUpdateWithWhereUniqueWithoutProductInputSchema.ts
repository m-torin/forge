import type { Prisma } from '../../client';

import { z } from 'zod';
import { CartItemWhereUniqueInputSchema } from './CartItemWhereUniqueInputSchema';
import { CartItemUpdateWithoutProductInputSchema } from './CartItemUpdateWithoutProductInputSchema';
import { CartItemUncheckedUpdateWithoutProductInputSchema } from './CartItemUncheckedUpdateWithoutProductInputSchema';

export const CartItemUpdateWithWhereUniqueWithoutProductInputSchema: z.ZodType<Prisma.CartItemUpdateWithWhereUniqueWithoutProductInput> =
  z
    .object({
      where: z.lazy(() => CartItemWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => CartItemUpdateWithoutProductInputSchema),
        z.lazy(() => CartItemUncheckedUpdateWithoutProductInputSchema),
      ]),
    })
    .strict();

export default CartItemUpdateWithWhereUniqueWithoutProductInputSchema;
