import type { Prisma } from '../../client';

import { z } from 'zod';
import { CartWhereUniqueInputSchema } from './CartWhereUniqueInputSchema';
import { CartCreateWithoutItemsInputSchema } from './CartCreateWithoutItemsInputSchema';
import { CartUncheckedCreateWithoutItemsInputSchema } from './CartUncheckedCreateWithoutItemsInputSchema';

export const CartCreateOrConnectWithoutItemsInputSchema: z.ZodType<Prisma.CartCreateOrConnectWithoutItemsInput> = z.object({
  where: z.lazy(() => CartWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => CartCreateWithoutItemsInputSchema),z.lazy(() => CartUncheckedCreateWithoutItemsInputSchema) ]),
}).strict();

export default CartCreateOrConnectWithoutItemsInputSchema;
