import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderItemCreateWithoutRegistryInputSchema } from './OrderItemCreateWithoutRegistryInputSchema';
import { OrderItemUncheckedCreateWithoutRegistryInputSchema } from './OrderItemUncheckedCreateWithoutRegistryInputSchema';
import { OrderItemCreateOrConnectWithoutRegistryInputSchema } from './OrderItemCreateOrConnectWithoutRegistryInputSchema';
import { OrderItemCreateManyRegistryInputEnvelopeSchema } from './OrderItemCreateManyRegistryInputEnvelopeSchema';
import { OrderItemWhereUniqueInputSchema } from './OrderItemWhereUniqueInputSchema';

export const OrderItemUncheckedCreateNestedManyWithoutRegistryInputSchema: z.ZodType<Prisma.OrderItemUncheckedCreateNestedManyWithoutRegistryInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => OrderItemCreateWithoutRegistryInputSchema),
          z.lazy(() => OrderItemCreateWithoutRegistryInputSchema).array(),
          z.lazy(() => OrderItemUncheckedCreateWithoutRegistryInputSchema),
          z.lazy(() => OrderItemUncheckedCreateWithoutRegistryInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => OrderItemCreateOrConnectWithoutRegistryInputSchema),
          z.lazy(() => OrderItemCreateOrConnectWithoutRegistryInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => OrderItemCreateManyRegistryInputEnvelopeSchema).optional(),
      connect: z
        .union([
          z.lazy(() => OrderItemWhereUniqueInputSchema),
          z.lazy(() => OrderItemWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default OrderItemUncheckedCreateNestedManyWithoutRegistryInputSchema;
