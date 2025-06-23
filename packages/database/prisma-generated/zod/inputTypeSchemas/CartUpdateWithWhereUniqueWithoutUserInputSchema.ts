import type { Prisma } from '../../client';

import { z } from 'zod';
import { CartWhereUniqueInputSchema } from './CartWhereUniqueInputSchema';
import { CartUpdateWithoutUserInputSchema } from './CartUpdateWithoutUserInputSchema';
import { CartUncheckedUpdateWithoutUserInputSchema } from './CartUncheckedUpdateWithoutUserInputSchema';

export const CartUpdateWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.CartUpdateWithWhereUniqueWithoutUserInput> =
  z
    .object({
      where: z.lazy(() => CartWhereUniqueInputSchema),
      data: z.union([
        z.lazy(() => CartUpdateWithoutUserInputSchema),
        z.lazy(() => CartUncheckedUpdateWithoutUserInputSchema),
      ]),
    })
    .strict();

export default CartUpdateWithWhereUniqueWithoutUserInputSchema;
