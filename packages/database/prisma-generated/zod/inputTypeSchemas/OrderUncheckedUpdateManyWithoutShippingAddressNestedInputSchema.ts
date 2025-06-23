import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderCreateWithoutShippingAddressInputSchema } from './OrderCreateWithoutShippingAddressInputSchema';
import { OrderUncheckedCreateWithoutShippingAddressInputSchema } from './OrderUncheckedCreateWithoutShippingAddressInputSchema';
import { OrderCreateOrConnectWithoutShippingAddressInputSchema } from './OrderCreateOrConnectWithoutShippingAddressInputSchema';
import { OrderUpsertWithWhereUniqueWithoutShippingAddressInputSchema } from './OrderUpsertWithWhereUniqueWithoutShippingAddressInputSchema';
import { OrderCreateManyShippingAddressInputEnvelopeSchema } from './OrderCreateManyShippingAddressInputEnvelopeSchema';
import { OrderWhereUniqueInputSchema } from './OrderWhereUniqueInputSchema';
import { OrderUpdateWithWhereUniqueWithoutShippingAddressInputSchema } from './OrderUpdateWithWhereUniqueWithoutShippingAddressInputSchema';
import { OrderUpdateManyWithWhereWithoutShippingAddressInputSchema } from './OrderUpdateManyWithWhereWithoutShippingAddressInputSchema';
import { OrderScalarWhereInputSchema } from './OrderScalarWhereInputSchema';

export const OrderUncheckedUpdateManyWithoutShippingAddressNestedInputSchema: z.ZodType<Prisma.OrderUncheckedUpdateManyWithoutShippingAddressNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => OrderCreateWithoutShippingAddressInputSchema),
          z.lazy(() => OrderCreateWithoutShippingAddressInputSchema).array(),
          z.lazy(() => OrderUncheckedCreateWithoutShippingAddressInputSchema),
          z.lazy(() => OrderUncheckedCreateWithoutShippingAddressInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => OrderCreateOrConnectWithoutShippingAddressInputSchema),
          z.lazy(() => OrderCreateOrConnectWithoutShippingAddressInputSchema).array(),
        ])
        .optional(),
      upsert: z
        .union([
          z.lazy(() => OrderUpsertWithWhereUniqueWithoutShippingAddressInputSchema),
          z.lazy(() => OrderUpsertWithWhereUniqueWithoutShippingAddressInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => OrderCreateManyShippingAddressInputEnvelopeSchema).optional(),
      set: z
        .union([
          z.lazy(() => OrderWhereUniqueInputSchema),
          z.lazy(() => OrderWhereUniqueInputSchema).array(),
        ])
        .optional(),
      disconnect: z
        .union([
          z.lazy(() => OrderWhereUniqueInputSchema),
          z.lazy(() => OrderWhereUniqueInputSchema).array(),
        ])
        .optional(),
      delete: z
        .union([
          z.lazy(() => OrderWhereUniqueInputSchema),
          z.lazy(() => OrderWhereUniqueInputSchema).array(),
        ])
        .optional(),
      connect: z
        .union([
          z.lazy(() => OrderWhereUniqueInputSchema),
          z.lazy(() => OrderWhereUniqueInputSchema).array(),
        ])
        .optional(),
      update: z
        .union([
          z.lazy(() => OrderUpdateWithWhereUniqueWithoutShippingAddressInputSchema),
          z.lazy(() => OrderUpdateWithWhereUniqueWithoutShippingAddressInputSchema).array(),
        ])
        .optional(),
      updateMany: z
        .union([
          z.lazy(() => OrderUpdateManyWithWhereWithoutShippingAddressInputSchema),
          z.lazy(() => OrderUpdateManyWithWhereWithoutShippingAddressInputSchema).array(),
        ])
        .optional(),
      deleteMany: z
        .union([
          z.lazy(() => OrderScalarWhereInputSchema),
          z.lazy(() => OrderScalarWhereInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default OrderUncheckedUpdateManyWithoutShippingAddressNestedInputSchema;
