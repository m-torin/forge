import type { Prisma } from '../../client';

import { z } from 'zod';
import { CartItemCreateWithoutRegistryInputSchema } from './CartItemCreateWithoutRegistryInputSchema';
import { CartItemUncheckedCreateWithoutRegistryInputSchema } from './CartItemUncheckedCreateWithoutRegistryInputSchema';
import { CartItemCreateOrConnectWithoutRegistryInputSchema } from './CartItemCreateOrConnectWithoutRegistryInputSchema';
import { CartItemCreateManyRegistryInputEnvelopeSchema } from './CartItemCreateManyRegistryInputEnvelopeSchema';
import { CartItemWhereUniqueInputSchema } from './CartItemWhereUniqueInputSchema';

export const CartItemUncheckedCreateNestedManyWithoutRegistryInputSchema: z.ZodType<Prisma.CartItemUncheckedCreateNestedManyWithoutRegistryInput> = z.object({
  create: z.union([ z.lazy(() => CartItemCreateWithoutRegistryInputSchema),z.lazy(() => CartItemCreateWithoutRegistryInputSchema).array(),z.lazy(() => CartItemUncheckedCreateWithoutRegistryInputSchema),z.lazy(() => CartItemUncheckedCreateWithoutRegistryInputSchema).array() ]).optional(),
  connectOrCreate: z.union([ z.lazy(() => CartItemCreateOrConnectWithoutRegistryInputSchema),z.lazy(() => CartItemCreateOrConnectWithoutRegistryInputSchema).array() ]).optional(),
  createMany: z.lazy(() => CartItemCreateManyRegistryInputEnvelopeSchema).optional(),
  connect: z.union([ z.lazy(() => CartItemWhereUniqueInputSchema),z.lazy(() => CartItemWhereUniqueInputSchema).array() ]).optional(),
}).strict();

export default CartItemUncheckedCreateNestedManyWithoutRegistryInputSchema;
