import type { Prisma } from '../../client';

import { z } from 'zod';
import { CartItemWhereUniqueInputSchema } from './CartItemWhereUniqueInputSchema';
import { CartItemUpdateWithoutRegistryInputSchema } from './CartItemUpdateWithoutRegistryInputSchema';
import { CartItemUncheckedUpdateWithoutRegistryInputSchema } from './CartItemUncheckedUpdateWithoutRegistryInputSchema';
import { CartItemCreateWithoutRegistryInputSchema } from './CartItemCreateWithoutRegistryInputSchema';
import { CartItemUncheckedCreateWithoutRegistryInputSchema } from './CartItemUncheckedCreateWithoutRegistryInputSchema';

export const CartItemUpsertWithWhereUniqueWithoutRegistryInputSchema: z.ZodType<Prisma.CartItemUpsertWithWhereUniqueWithoutRegistryInput> =
  z
    .object({
      where: z.lazy(() => CartItemWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => CartItemUpdateWithoutRegistryInputSchema),
        z.lazy(() => CartItemUncheckedUpdateWithoutRegistryInputSchema),
      ]),
      create: z.union([
        z.lazy(() => CartItemCreateWithoutRegistryInputSchema),
        z.lazy(() => CartItemUncheckedCreateWithoutRegistryInputSchema),
      ]),
    })
    .strict();

export default CartItemUpsertWithWhereUniqueWithoutRegistryInputSchema;
