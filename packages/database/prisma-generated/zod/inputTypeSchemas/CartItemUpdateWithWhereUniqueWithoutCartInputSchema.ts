import type { Prisma } from '../../client';

import { z } from 'zod';
import { CartItemWhereUniqueInputSchema } from './CartItemWhereUniqueInputSchema';
import { CartItemUpdateWithoutCartInputSchema } from './CartItemUpdateWithoutCartInputSchema';
import { CartItemUncheckedUpdateWithoutCartInputSchema } from './CartItemUncheckedUpdateWithoutCartInputSchema';

export const CartItemUpdateWithWhereUniqueWithoutCartInputSchema: z.ZodType<Prisma.CartItemUpdateWithWhereUniqueWithoutCartInput> =
  z
    .object({
      where: z.lazy(() => CartItemWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => CartItemUpdateWithoutCartInputSchema),
        z.lazy(() => CartItemUncheckedUpdateWithoutCartInputSchema),
      ]),
    })
    .strict();

export default CartItemUpdateWithWhereUniqueWithoutCartInputSchema;
