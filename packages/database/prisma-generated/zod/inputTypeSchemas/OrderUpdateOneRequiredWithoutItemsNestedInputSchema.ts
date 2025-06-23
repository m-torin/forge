import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderCreateWithoutItemsInputSchema } from './OrderCreateWithoutItemsInputSchema';
import { OrderUncheckedCreateWithoutItemsInputSchema } from './OrderUncheckedCreateWithoutItemsInputSchema';
import { OrderCreateOrConnectWithoutItemsInputSchema } from './OrderCreateOrConnectWithoutItemsInputSchema';
import { OrderUpsertWithoutItemsInputSchema } from './OrderUpsertWithoutItemsInputSchema';
import { OrderWhereUniqueInputSchema } from './OrderWhereUniqueInputSchema';
import { OrderUpdateToOneWithWhereWithoutItemsInputSchema } from './OrderUpdateToOneWithWhereWithoutItemsInputSchema';
import { OrderUpdateWithoutItemsInputSchema } from './OrderUpdateWithoutItemsInputSchema';
import { OrderUncheckedUpdateWithoutItemsInputSchema } from './OrderUncheckedUpdateWithoutItemsInputSchema';

export const OrderUpdateOneRequiredWithoutItemsNestedInputSchema: z.ZodType<Prisma.OrderUpdateOneRequiredWithoutItemsNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => OrderCreateWithoutItemsInputSchema),
          z.lazy(() => OrderUncheckedCreateWithoutItemsInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => OrderCreateOrConnectWithoutItemsInputSchema).optional(),
      upsert: z.lazy(() => OrderUpsertWithoutItemsInputSchema).optional(),
      connect: z.lazy(() => OrderWhereUniqueInputSchema).optional(),
      update: z
        .union([
          z.lazy(() => OrderUpdateToOneWithWhereWithoutItemsInputSchema),
          z.lazy(() => OrderUpdateWithoutItemsInputSchema),
          z.lazy(() => OrderUncheckedUpdateWithoutItemsInputSchema),
        ])
        .optional(),
    })
    .strict();

export default OrderUpdateOneRequiredWithoutItemsNestedInputSchema;
