import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderCreateWithoutShippingAddressInputSchema } from './OrderCreateWithoutShippingAddressInputSchema';
import { OrderUncheckedCreateWithoutShippingAddressInputSchema } from './OrderUncheckedCreateWithoutShippingAddressInputSchema';
import { OrderCreateOrConnectWithoutShippingAddressInputSchema } from './OrderCreateOrConnectWithoutShippingAddressInputSchema';
import { OrderCreateManyShippingAddressInputEnvelopeSchema } from './OrderCreateManyShippingAddressInputEnvelopeSchema';
import { OrderWhereUniqueInputSchema } from './OrderWhereUniqueInputSchema';

export const OrderUncheckedCreateNestedManyWithoutShippingAddressInputSchema: z.ZodType<Prisma.OrderUncheckedCreateNestedManyWithoutShippingAddressInput> =
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
      createMany: z.lazy(() => OrderCreateManyShippingAddressInputEnvelopeSchema).optional(),
      connect: z
        .union([
          z.lazy(() => OrderWhereUniqueInputSchema),
          z.lazy(() => OrderWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default OrderUncheckedCreateNestedManyWithoutShippingAddressInputSchema;
