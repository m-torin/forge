import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderItemCreateWithoutProductInputSchema } from './OrderItemCreateWithoutProductInputSchema';
import { OrderItemUncheckedCreateWithoutProductInputSchema } from './OrderItemUncheckedCreateWithoutProductInputSchema';
import { OrderItemCreateOrConnectWithoutProductInputSchema } from './OrderItemCreateOrConnectWithoutProductInputSchema';
import { OrderItemUpsertWithWhereUniqueWithoutProductInputSchema } from './OrderItemUpsertWithWhereUniqueWithoutProductInputSchema';
import { OrderItemCreateManyProductInputEnvelopeSchema } from './OrderItemCreateManyProductInputEnvelopeSchema';
import { OrderItemWhereUniqueInputSchema } from './OrderItemWhereUniqueInputSchema';
import { OrderItemUpdateWithWhereUniqueWithoutProductInputSchema } from './OrderItemUpdateWithWhereUniqueWithoutProductInputSchema';
import { OrderItemUpdateManyWithWhereWithoutProductInputSchema } from './OrderItemUpdateManyWithWhereWithoutProductInputSchema';
import { OrderItemScalarWhereInputSchema } from './OrderItemScalarWhereInputSchema';

export const OrderItemUncheckedUpdateManyWithoutProductNestedInputSchema: z.ZodType<Prisma.OrderItemUncheckedUpdateManyWithoutProductNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => OrderItemCreateWithoutProductInputSchema),
          z.lazy(() => OrderItemCreateWithoutProductInputSchema).array(),
          z.lazy(() => OrderItemUncheckedCreateWithoutProductInputSchema),
          z.lazy(() => OrderItemUncheckedCreateWithoutProductInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => OrderItemCreateOrConnectWithoutProductInputSchema),
          z.lazy(() => OrderItemCreateOrConnectWithoutProductInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => OrderItemUpsertWithWhereUniqueWithoutProductInputSchema),
          z.lazy(() => OrderItemUpsertWithWhereUniqueWithoutProductInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => OrderItemCreateManyProductInputEnvelopeSchema).optional(),
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
          z.lazy(() => OrderItemUpdateWithWhereUniqueWithoutProductInputSchema),
          z.lazy(() => OrderItemUpdateWithWhereUniqueWithoutProductInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => OrderItemUpdateManyWithWhereWithoutProductInputSchema),
          z.lazy(() => OrderItemUpdateManyWithWhereWithoutProductInputSchema).array(),
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

export default OrderItemUncheckedUpdateManyWithoutProductNestedInputSchema;
