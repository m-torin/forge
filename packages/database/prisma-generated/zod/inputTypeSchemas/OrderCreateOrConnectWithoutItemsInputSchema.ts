import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderWhereUniqueInputSchema } from './OrderWhereUniqueInputSchema';
import { OrderCreateWithoutItemsInputSchema } from './OrderCreateWithoutItemsInputSchema';
import { OrderUncheckedCreateWithoutItemsInputSchema } from './OrderUncheckedCreateWithoutItemsInputSchema';

export const OrderCreateOrConnectWithoutItemsInputSchema: z.ZodType<Prisma.OrderCreateOrConnectWithoutItemsInput> =
  z
    .object({
      where: z.lazy(() => OrderWhereUniqueInputSchema),
      create: z.union([
        z.lazy(() => OrderCreateWithoutItemsInputSchema),
        z.lazy(() => OrderUncheckedCreateWithoutItemsInputSchema),
      ]),
    })
    .strict();

export default OrderCreateOrConnectWithoutItemsInputSchema;
