import type { Prisma } from '../../client';

import { z } from 'zod';
import { CartItemWhereUniqueInputSchema } from './CartItemWhereUniqueInputSchema';
import { CartItemUpdateWithoutVariantInputSchema } from './CartItemUpdateWithoutVariantInputSchema';
import { CartItemUncheckedUpdateWithoutVariantInputSchema } from './CartItemUncheckedUpdateWithoutVariantInputSchema';

export const CartItemUpdateWithWhereUniqueWithoutVariantInputSchema: z.ZodType<Prisma.CartItemUpdateWithWhereUniqueWithoutVariantInput> = z.object({
  where: z.lazy(() => CartItemWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => CartItemUpdateWithoutVariantInputSchema),z.lazy(() => CartItemUncheckedUpdateWithoutVariantInputSchema) ]),
}).strict();

export default CartItemUpdateWithWhereUniqueWithoutVariantInputSchema;
