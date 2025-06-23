import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderItemCreateWithoutRegistryInputSchema } from './OrderItemCreateWithoutRegistryInputSchema';
import { OrderItemUncheckedCreateWithoutRegistryInputSchema } from './OrderItemUncheckedCreateWithoutRegistryInputSchema';
import { OrderItemCreateOrConnectWithoutRegistryInputSchema } from './OrderItemCreateOrConnectWithoutRegistryInputSchema';
import { OrderItemUpsertWithWhereUniqueWithoutRegistryInputSchema } from './OrderItemUpsertWithWhereUniqueWithoutRegistryInputSchema';
import { OrderItemCreateManyRegistryInputEnvelopeSchema } from './OrderItemCreateManyRegistryInputEnvelopeSchema';
import { OrderItemWhereUniqueInputSchema } from './OrderItemWhereUniqueInputSchema';
import { OrderItemUpdateWithWhereUniqueWithoutRegistryInputSchema } from './OrderItemUpdateWithWhereUniqueWithoutRegistryInputSchema';
import { OrderItemUpdateManyWithWhereWithoutRegistryInputSchema } from './OrderItemUpdateManyWithWhereWithoutRegistryInputSchema';
import { OrderItemScalarWhereInputSchema } from './OrderItemScalarWhereInputSchema';

export const OrderItemUncheckedUpdateManyWithoutRegistryNestedInputSchema: z.ZodType<Prisma.OrderItemUncheckedUpdateManyWithoutRegistryNestedInput> =
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
      upsert: z
        .union([
          z.lazy(() => OrderItemUpsertWithWhereUniqueWithoutRegistryInputSchema),
          z.lazy(() => OrderItemUpsertWithWhereUniqueWithoutRegistryInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => OrderItemCreateManyRegistryInputEnvelopeSchema).optional(),
      set: z
        .union([
          z.lazy(() => OrderItemWhereUniqueInputSchema),
          z.lazy(() => OrderItemWhereUniqueInputSchema).array(),
        ])
        .optional(),
      disconnect: z
        .union([
          z.lazy(() => OrderItemWhereUniqueInputSchema),
          z.lazy(() => OrderItemWhereUniqueInputSchema).array(),
        ])
        .optional(),
      delete: z
        .union([
          z.lazy(() => OrderItemWhereUniqueInputSchema),
          z.lazy(() => OrderItemWhereUniqueInputSchema).array(),
        ])
        .optional(),
      connect: z
        .union([
          z.lazy(() => OrderItemWhereUniqueInputSchema),
          z.lazy(() => OrderItemWhereUniqueInputSchema).array(),
        ])
        .optional(),
      update: z
        .union([
          z.lazy(() => OrderItemUpdateWithWhereUniqueWithoutRegistryInputSchema),
          z.lazy(() => OrderItemUpdateWithWhereUniqueWithoutRegistryInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => OrderItemUpdateManyWithWhereWithoutRegistryInputSchema),
          z.lazy(() => OrderItemUpdateManyWithWhereWithoutRegistryInputSchema).array(),
        ])
        .optional(),
      deleteMany: z
        .union([
          z.lazy(() => OrderItemScalarWhereInputSchema),
          z.lazy(() => OrderItemScalarWhereInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default OrderItemUncheckedUpdateManyWithoutRegistryNestedInputSchema;
