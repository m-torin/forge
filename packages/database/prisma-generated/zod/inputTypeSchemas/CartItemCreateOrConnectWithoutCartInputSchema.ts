import type { Prisma } from '../../client';

import { z } from 'zod';
import { CartItemWhereUniqueInputSchema } from './CartItemWhereUniqueInputSchema';
import { CartItemCreateWithoutCartInputSchema } from './CartItemCreateWithoutCartInputSchema';
import { CartItemUncheckedCreateWithoutCartInputSchema } from './CartItemUncheckedCreateWithoutCartInputSchema';

export const CartItemCreateOrConnectWithoutCartInputSchema: z.ZodType<Prisma.CartItemCreateOrConnectWithoutCartInput> =
  z
    .object({
      where: z.lazy(() => CartItemWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => CartItemCreateWithoutCartInputSchema),
        z.lazy(() => CartItemUncheckedCreateWithoutCartInputSchema),
      ]),
    })
    .strict();

export default CartItemCreateOrConnectWithoutCartInputSchema;
