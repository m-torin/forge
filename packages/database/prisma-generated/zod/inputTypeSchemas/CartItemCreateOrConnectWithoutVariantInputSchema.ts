import type { Prisma } from '../../client';

import { z } from 'zod';
import { CartItemWhereUniqueInputSchema } from './CartItemWhereUniqueInputSchema';
import { CartItemCreateWithoutVariantInputSchema } from './CartItemCreateWithoutVariantInputSchema';
import { CartItemUncheckedCreateWithoutVariantInputSchema } from './CartItemUncheckedCreateWithoutVariantInputSchema';

export const CartItemCreateOrConnectWithoutVariantInputSchema: z.ZodType<Prisma.CartItemCreateOrConnectWithoutVariantInput> = z.object({
  where: z.lazy(() => CartItemWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CartItemCreateWithoutVariantInputSchema),z.lazy(() => CartItemUncheckedCreateWithoutVariantInputSchema) ]),
}).strict();

export default CartItemCreateOrConnectWithoutVariantInputSchema;
