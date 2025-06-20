import type { Prisma } from '../../client';

import { z } from 'zod';
import { CartCreateWithoutItemsInputSchema } from './CartCreateWithoutItemsInputSchema';
import { CartUncheckedCreateWithoutItemsInputSchema } from './CartUncheckedCreateWithoutItemsInputSchema';
import { CartCreateOrConnectWithoutItemsInputSchema } from './CartCreateOrConnectWithoutItemsInputSchema';
import { CartUpsertWithoutItemsInputSchema } from './CartUpsertWithoutItemsInputSchema';
import { CartWhereUniqueInputSchema } from './CartWhereUniqueInputSchema';
import { CartUpdateToOneWithWhereWithoutItemsInputSchema } from './CartUpdateToOneWithWhereWithoutItemsInputSchema';
import { CartUpdateWithoutItemsInputSchema } from './CartUpdateWithoutItemsInputSchema';
import { CartUncheckedUpdateWithoutItemsInputSchema } from './CartUncheckedUpdateWithoutItemsInputSchema';

export const CartUpdateOneRequiredWithoutItemsNestedInputSchema: z.ZodType<Prisma.CartUpdateOneRequiredWithoutItemsNestedInput> = z.object({
  create: z.union([ z.lazy(() => CartCreateWithoutItemsInputSchema),z.lazy(() => CartUncheckedCreateWithoutItemsInputSchema) ]).optional(),
  connectOrCreate: z.lazy(() => CartCreateOrConnectWithoutItemsInputSchema).optional(),
  upsert: z.lazy(() => CartUpsertWithoutItemsInputSchema).optional(),
  connect: z.lazy(() => CartWhereUniqueInputSchema).optional(),
  update: z.union([ z.lazy(() => CartUpdateToOneWithWhereWithoutItemsInputSchema),z.lazy(() => CartUpdateWithoutItemsInputSchema),z.lazy(() => CartUncheckedUpdateWithoutItemsInputSchema) ]).optional(),
}).strict();

export default CartUpdateOneRequiredWithoutItemsNestedInputSchema;
