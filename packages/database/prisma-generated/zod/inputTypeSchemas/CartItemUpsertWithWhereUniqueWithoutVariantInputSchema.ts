import type { Prisma } from '../../client';

import { z } from 'zod';
import { CartItemWhereUniqueInputSchema } from './CartItemWhereUniqueInputSchema';
import { CartItemUpdateWithoutVariantInputSchema } from './CartItemUpdateWithoutVariantInputSchema';
import { CartItemUncheckedUpdateWithoutVariantInputSchema } from './CartItemUncheckedUpdateWithoutVariantInputSchema';
import { CartItemCreateWithoutVariantInputSchema } from './CartItemCreateWithoutVariantInputSchema';
import { CartItemUncheckedCreateWithoutVariantInputSchema } from './CartItemUncheckedCreateWithoutVariantInputSchema';

export const CartItemUpsertWithWhereUniqueWithoutVariantInputSchema: z.ZodType<Prisma.CartItemUpsertWithWhereUniqueWithoutVariantInput> =
  z
    .object({
      where: z.lazy(() => CartItemWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => CartItemUpdateWithoutVariantInputSchema),
        z.lazy(() => CartItemUncheckedUpdateWithoutVariantInputSchema),
      ]),
      create: z.union([
        z.lazy(() => CartItemCreateWithoutVariantInputSchema),
        z.lazy(() => CartItemUncheckedCreateWithoutVariantInputSchema),
      ]),
    })
    .strict();

export default CartItemUpsertWithWhereUniqueWithoutVariantInputSchema;
