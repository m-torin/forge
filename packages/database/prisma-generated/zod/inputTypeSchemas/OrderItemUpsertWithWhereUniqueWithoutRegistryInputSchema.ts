import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderItemWhereUniqueInputSchema } from './OrderItemWhereUniqueInputSchema';
import { OrderItemUpdateWithoutRegistryInputSchema } from './OrderItemUpdateWithoutRegistryInputSchema';
import { OrderItemUncheckedUpdateWithoutRegistryInputSchema } from './OrderItemUncheckedUpdateWithoutRegistryInputSchema';
import { OrderItemCreateWithoutRegistryInputSchema } from './OrderItemCreateWithoutRegistryInputSchema';
import { OrderItemUncheckedCreateWithoutRegistryInputSchema } from './OrderItemUncheckedCreateWithoutRegistryInputSchema';

export const OrderItemUpsertWithWhereUniqueWithoutRegistryInputSchema: z.ZodType<Prisma.OrderItemUpsertWithWhereUniqueWithoutRegistryInput> =
  z
    .object({
      where: z.lazy(() => OrderItemWhereUniqueInputSchema),
      update: z.union([
        z.lazy(() => OrderItemUpdateWithoutRegistryInputSchema),
        z.lazy(() => OrderItemUncheckedUpdateWithoutRegistryInputSchema),
      ]),
      create: z.union([
        z.lazy(() => OrderItemCreateWithoutRegistryInputSchema),
        z.lazy(() => OrderItemUncheckedCreateWithoutRegistryInputSchema),
      ]),
    })
    .strict();

export default OrderItemUpsertWithWhereUniqueWithoutRegistryInputSchema;
