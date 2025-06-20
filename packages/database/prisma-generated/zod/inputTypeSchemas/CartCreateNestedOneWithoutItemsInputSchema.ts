import type { Prisma } from '../../client';

import { z } from 'zod';
import { CartCreateWithoutItemsInputSchema } from './CartCreateWithoutItemsInputSchema';
import { CartUncheckedCreateWithoutItemsInputSchema } from './CartUncheckedCreateWithoutItemsInputSchema';
import { CartCreateOrConnectWithoutItemsInputSchema } from './CartCreateOrConnectWithoutItemsInputSchema';
import { CartWhereUniqueInputSchema } from './CartWhereUniqueInputSchema';

export const CartCreateNestedOneWithoutItemsInputSchema: z.ZodType<Prisma.CartCreateNestedOneWithoutItemsInput> = z.object({
  create: z.union([ z.lazy(() => CartCreateWithoutItemsInputSchema),z.lazy(() => CartUncheckedCreateWithoutItemsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => CartCreateOrConnectWithoutItemsInputSchema).optional(),
  connect: z.lazy(() => CartWhereUniqueInputSchema).optional()
}).strict();

export default CartCreateNestedOneWithoutItemsInputSchema;
