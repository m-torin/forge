import type { Prisma } from '../../client';

import { z } from 'zod';
import { CartWhereUniqueInputSchema } from './CartWhereUniqueInputSchema';
import { CartCreateWithoutUserInputSchema } from './CartCreateWithoutUserInputSchema';
import { CartUncheckedCreateWithoutUserInputSchema } from './CartUncheckedCreateWithoutUserInputSchema';

export const CartCreateOrConnectWithoutUserInputSchema: z.ZodType<Prisma.CartCreateOrConnectWithoutUserInput> =
  z
    .object({
      where: z.lazy(() => CartWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => CartCreateWithoutUserInputSchema),
        z.lazy(() => CartUncheckedCreateWithoutUserInputSchema),
      ]),
    })
    .strict();

export default CartCreateOrConnectWithoutUserInputSchema;
