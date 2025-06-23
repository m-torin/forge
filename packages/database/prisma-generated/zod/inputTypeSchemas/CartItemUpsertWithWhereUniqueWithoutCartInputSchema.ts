import type { Prisma } from '../../client';

import { z } from 'zod';
import { CartItemWhereUniqueInputSchema } from './CartItemWhereUniqueInputSchema';
import { CartItemUpdateWithoutCartInputSchema } from './CartItemUpdateWithoutCartInputSchema';
import { CartItemUncheckedUpdateWithoutCartInputSchema } from './CartItemUncheckedUpdateWithoutCartInputSchema';
import { CartItemCreateWithoutCartInputSchema } from './CartItemCreateWithoutCartInputSchema';
import { CartItemUncheckedCreateWithoutCartInputSchema } from './CartItemUncheckedCreateWithoutCartInputSchema';

export const CartItemUpsertWithWhereUniqueWithoutCartInputSchema: z.ZodType<Prisma.CartItemUpsertWithWhereUniqueWithoutCartInput> =
  z
    .object({
      where: z.lazy(() => CartItemWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => CartItemUpdateWithoutCartInputSchema),
        z.lazy(() => CartItemUncheckedUpdateWithoutCartInputSchema),
      ]),
      create: z.union([
        z.lazy(() => CartItemCreateWithoutCartInputSchema),
        z.lazy(() => CartItemUncheckedCreateWithoutCartInputSchema),
      ]),
    })
    .strict();

export default CartItemUpsertWithWhereUniqueWithoutCartInputSchema;
