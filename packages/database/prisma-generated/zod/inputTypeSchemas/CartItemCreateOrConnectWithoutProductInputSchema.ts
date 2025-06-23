import type { Prisma } from '../../client';

import { z } from 'zod';
import { CartItemWhereUniqueInputSchema } from './CartItemWhereUniqueInputSchema';
import { CartItemCreateWithoutProductInputSchema } from './CartItemCreateWithoutProductInputSchema';
import { CartItemUncheckedCreateWithoutProductInputSchema } from './CartItemUncheckedCreateWithoutProductInputSchema';

export const CartItemCreateOrConnectWithoutProductInputSchema: z.ZodType<Prisma.CartItemCreateOrConnectWithoutProductInput> =
  z
    .object({
      where: z.lazy(() => CartItemWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => CartItemCreateWithoutProductInputSchema),
        z.lazy(() => CartItemUncheckedCreateWithoutProductInputSchema),
      ]),
    })
    .strict();

export default CartItemCreateOrConnectWithoutProductInputSchema;
