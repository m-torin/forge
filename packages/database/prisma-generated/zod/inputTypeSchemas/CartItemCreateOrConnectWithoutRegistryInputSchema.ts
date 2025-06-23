import type { Prisma } from '../../client';

import { z } from 'zod';
import { CartItemWhereUniqueInputSchema } from './CartItemWhereUniqueInputSchema';
import { CartItemCreateWithoutRegistryInputSchema } from './CartItemCreateWithoutRegistryInputSchema';
import { CartItemUncheckedCreateWithoutRegistryInputSchema } from './CartItemUncheckedCreateWithoutRegistryInputSchema';

export const CartItemCreateOrConnectWithoutRegistryInputSchema: z.ZodType<Prisma.CartItemCreateOrConnectWithoutRegistryInput> =
  z
    .object({
      where: z.lazy(() => CartItemWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => CartItemCreateWithoutRegistryInputSchema),
        z.lazy(() => CartItemUncheckedCreateWithoutRegistryInputSchema),
      ]),
    })
    .strict();

export default CartItemCreateOrConnectWithoutRegistryInputSchema;
