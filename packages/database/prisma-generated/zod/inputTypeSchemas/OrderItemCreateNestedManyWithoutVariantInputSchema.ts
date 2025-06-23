import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderItemCreateWithoutVariantInputSchema } from './OrderItemCreateWithoutVariantInputSchema';
import { OrderItemUncheckedCreateWithoutVariantInputSchema } from './OrderItemUncheckedCreateWithoutVariantInputSchema';
import { OrderItemCreateOrConnectWithoutVariantInputSchema } from './OrderItemCreateOrConnectWithoutVariantInputSchema';
import { OrderItemCreateManyVariantInputEnvelopeSchema } from './OrderItemCreateManyVariantInputEnvelopeSchema';
import { OrderItemWhereUniqueInputSchema } from './OrderItemWhereUniqueInputSchema';

export const OrderItemCreateNestedManyWithoutVariantInputSchema: z.ZodType<Prisma.OrderItemCreateNestedManyWithoutVariantInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => OrderItemCreateWithoutVariantInputSchema),
          z.lazy(() => OrderItemCreateWithoutVariantInputSchema).array(),
          z.lazy(() => OrderItemUncheckedCreateWithoutVariantInputSchema),
          z.lazy(() => OrderItemUncheckedCreateWithoutVariantInputSchema).array(),
        ])
        .optional(),
      connectOrCreate: z
        .union([
          z.lazy(() => OrderItemCreateOrConnectWithoutVariantInputSchema),
          z.lazy(() => OrderItemCreateOrConnectWithoutVariantInputSchema).array(),
        ])
        .optional(),
      createMany: z.lazy(() => OrderItemCreateManyVariantInputEnvelopeSchema).optional(),
      connect: z
        .union([
          z.lazy(() => OrderItemWhereUniqueInputSchema),
          z.lazy(() => OrderItemWhereUniqueInputSchema).array(),
        ])
        .optional(),
    })
    .strict();

export default OrderItemCreateNestedManyWithoutVariantInputSchema;
