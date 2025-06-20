import type { Prisma } from '../../client';

import { z } from 'zod';
import { CartItemScalarWhereInputSchema } from './CartItemScalarWhereInputSchema';
import { CartItemUpdateManyMutationInputSchema } from './CartItemUpdateManyMutationInputSchema';
import { CartItemUncheckedUpdateManyWithoutRegistryInputSchema } from './CartItemUncheckedUpdateManyWithoutRegistryInputSchema';

export const CartItemUpdateManyWithWhereWithoutRegistryInputSchema: z.ZodType<Prisma.CartItemUpdateManyWithWhereWithoutRegistryInput> = z.object({
  where: z.lazy(() => CartItemScalarWhereInputSchema),
  data: z.union([ z.lazy(() => CartItemUpdateManyMutationInputSchema),z.lazy(() => CartItemUncheckedUpdateManyWithoutRegistryInputSchema) ]),
}).strict();

export default CartItemUpdateManyWithWhereWithoutRegistryInputSchema;
