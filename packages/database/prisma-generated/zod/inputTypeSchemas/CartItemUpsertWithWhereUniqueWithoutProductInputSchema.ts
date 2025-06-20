import type { Prisma } from '../../client';

import { z } from 'zod';
import { CartItemWhereUniqueInputSchema } from './CartItemWhereUniqueInputSchema';
import { CartItemUpdateWithoutProductInputSchema } from './CartItemUpdateWithoutProductInputSchema';
import { CartItemUncheckedUpdateWithoutProductInputSchema } from './CartItemUncheckedUpdateWithoutProductInputSchema';
import { CartItemCreateWithoutProductInputSchema } from './CartItemCreateWithoutProductInputSchema';
import { CartItemUncheckedCreateWithoutProductInputSchema } from './CartItemUncheckedCreateWithoutProductInputSchema';

export const CartItemUpsertWithWhereUniqueWithoutProductInputSchema: z.ZodType<Prisma.CartItemUpsertWithWhereUniqueWithoutProductInput> = z.object({
  where: z.lazy(() => CartItemWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => CartItemUpdateWithoutProductInputSchema),z.lazy(() => CartItemUncheckedUpdateWithoutProductInputSchema) ]),
  create: z.union([ z.lazy(() => CartItemCreateWithoutProductInputSchema),z.lazy(() => CartItemUncheckedCreateWithoutProductInputSchema) ]),
}).strict();

export default CartItemUpsertWithWhereUniqueWithoutProductInputSchema;
