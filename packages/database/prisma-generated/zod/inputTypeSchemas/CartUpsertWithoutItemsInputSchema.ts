import type { Prisma } from '../../client';

import { z } from 'zod';
import { CartUpdateWithoutItemsInputSchema } from './CartUpdateWithoutItemsInputSchema';
import { CartUncheckedUpdateWithoutItemsInputSchema } from './CartUncheckedUpdateWithoutItemsInputSchema';
import { CartCreateWithoutItemsInputSchema } from './CartCreateWithoutItemsInputSchema';
import { CartUncheckedCreateWithoutItemsInputSchema } from './CartUncheckedCreateWithoutItemsInputSchema';
import { CartWhereInputSchema } from './CartWhereInputSchema';

export const CartUpsertWithoutItemsInputSchema: z.ZodType<Prisma.CartUpsertWithoutItemsInput> = z.object({
  update: z.union([ z.lazy(() => CartUpdateWithoutItemsInputSchema),z.lazy(() => CartUncheckedUpdateWithoutItemsInputSchema) ]),
  create: z.union([ z.lazy(() => CartCreateWithoutItemsInputSchema),z.lazy(() => CartUncheckedCreateWithoutItemsInputSchema) ]),
  where: z.lazy(() => CartWhereInputSchema).optional()
}).strict();

export default CartUpsertWithoutItemsInputSchema;
