import type { Prisma } from '../../client';

import { z } from 'zod';
import { CartItemWhereUniqueInputSchema } from './CartItemWhereUniqueInputSchema';
import { CartItemUpdateWithoutRegistryInputSchema } from './CartItemUpdateWithoutRegistryInputSchema';
import { CartItemUncheckedUpdateWithoutRegistryInputSchema } from './CartItemUncheckedUpdateWithoutRegistryInputSchema';

export const CartItemUpdateWithWhereUniqueWithoutRegistryInputSchema: z.ZodType<Prisma.CartItemUpdateWithWhereUniqueWithoutRegistryInput> =
  z
    .object({
      where: z.lazy(() => CartItemWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => CartItemUpdateWithoutRegistryInputSchema),
        z.lazy(() => CartItemUncheckedUpdateWithoutRegistryInputSchema),
      ]),
    })
    .strict();

export default CartItemUpdateWithWhereUniqueWithoutRegistryInputSchema;
