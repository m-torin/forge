import type { Prisma } from '../../client';

import { z } from 'zod';
import { CartItemScalarWhereInputSchema } from './CartItemScalarWhereInputSchema';
import { CartItemUpdateManyMutationInputSchema } from './CartItemUpdateManyMutationInputSchema';
import { CartItemUncheckedUpdateManyWithoutVariantInputSchema } from './CartItemUncheckedUpdateManyWithoutVariantInputSchema';

export const CartItemUpdateManyWithWhereWithoutVariantInputSchema: z.ZodType<Prisma.CartItemUpdateManyWithWhereWithoutVariantInput> = z.object({
  where: z.lazy(() => CartItemScalarWhereInputSchema),
  data: z.union([ z.lazy(() => CartItemUpdateManyMutationInputSchema),z.lazy(() => CartItemUncheckedUpdateManyWithoutVariantInputSchema) ]),
}).strict();

export default CartItemUpdateManyWithWhereWithoutVariantInputSchema;
