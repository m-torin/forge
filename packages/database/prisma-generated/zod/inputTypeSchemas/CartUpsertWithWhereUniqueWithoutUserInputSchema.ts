import type { Prisma } from '../../client';

import { z } from 'zod';
import { CartWhereUniqueInputSchema } from './CartWhereUniqueInputSchema';
import { CartUpdateWithoutUserInputSchema } from './CartUpdateWithoutUserInputSchema';
import { CartUncheckedUpdateWithoutUserInputSchema } from './CartUncheckedUpdateWithoutUserInputSchema';
import { CartCreateWithoutUserInputSchema } from './CartCreateWithoutUserInputSchema';
import { CartUncheckedCreateWithoutUserInputSchema } from './CartUncheckedCreateWithoutUserInputSchema';

export const CartUpsertWithWhereUniqueWithoutUserInputSchema: z.ZodType<Prisma.CartUpsertWithWhereUniqueWithoutUserInput> = z.object({
  where: z.lazy(() => CartWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => CartUpdateWithoutUserInputSchema),z.lazy(() => CartUncheckedUpdateWithoutUserInputSchema) ]),
  create: z.union([ z.lazy(() => CartCreateWithoutUserInputSchema),z.lazy(() => CartUncheckedCreateWithoutUserInputSchema) ]),
}).strict();

export default CartUpsertWithWhereUniqueWithoutUserInputSchema;
