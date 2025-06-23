import type { Prisma } from '../../client';

import { z } from 'zod';
import { CartItemScalarWhereInputSchema } from './CartItemScalarWhereInputSchema';
import { CartItemUpdateManyMutationInputSchema } from './CartItemUpdateManyMutationInputSchema';
import { CartItemUncheckedUpdateManyWithoutCartInputSchema } from './CartItemUncheckedUpdateManyWithoutCartInputSchema';

export const CartItemUpdateManyWithWhereWithoutCartInputSchema: z.ZodType<Prisma.CartItemUpdateManyWithWhereWithoutCartInput> =
  z
    .object({
      where: z.lazy(() => CartItemScalarWhereInputSchema),
      data: z.union([
        z.lazy(() => CartItemUpdateManyMutationInputSchema),
        z.lazy(() => CartItemUncheckedUpdateManyWithoutCartInputSchema),
      ]),
    })
    .strict();

export default CartItemUpdateManyWithWhereWithoutCartInputSchema;
