import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderItemWhereUniqueInputSchema } from './OrderItemWhereUniqueInputSchema';
import { OrderItemCreateWithoutRegistryInputSchema } from './OrderItemCreateWithoutRegistryInputSchema';
import { OrderItemUncheckedCreateWithoutRegistryInputSchema } from './OrderItemUncheckedCreateWithoutRegistryInputSchema';

export const OrderItemCreateOrConnectWithoutRegistryInputSchema: z.ZodType<Prisma.OrderItemCreateOrConnectWithoutRegistryInput> =
  z
    .object({
      where: z.lazy(() => OrderItemWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => OrderItemCreateWithoutRegistryInputSchema),
        z.lazy(() => OrderItemUncheckedCreateWithoutRegistryInputSchema),
      ]),
    })
    .strict();

export default OrderItemCreateOrConnectWithoutRegistryInputSchema;
