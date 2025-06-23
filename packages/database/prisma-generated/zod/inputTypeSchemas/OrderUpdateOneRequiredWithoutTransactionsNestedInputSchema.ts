import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderCreateWithoutTransactionsInputSchema } from './OrderCreateWithoutTransactionsInputSchema';
import { OrderUncheckedCreateWithoutTransactionsInputSchema } from './OrderUncheckedCreateWithoutTransactionsInputSchema';
import { OrderCreateOrConnectWithoutTransactionsInputSchema } from './OrderCreateOrConnectWithoutTransactionsInputSchema';
import { OrderUpsertWithoutTransactionsInputSchema } from './OrderUpsertWithoutTransactionsInputSchema';
import { OrderWhereUniqueInputSchema } from './OrderWhereUniqueInputSchema';
import { OrderUpdateToOneWithWhereWithoutTransactionsInputSchema } from './OrderUpdateToOneWithWhereWithoutTransactionsInputSchema';
import { OrderUpdateWithoutTransactionsInputSchema } from './OrderUpdateWithoutTransactionsInputSchema';
import { OrderUncheckedUpdateWithoutTransactionsInputSchema } from './OrderUncheckedUpdateWithoutTransactionsInputSchema';

export const OrderUpdateOneRequiredWithoutTransactionsNestedInputSchema: z.ZodType<Prisma.OrderUpdateOneRequiredWithoutTransactionsNestedInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => OrderCreateWithoutTransactionsInputSchema),
          z.lazy(() => OrderUncheckedCreateWithoutTransactionsInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => OrderCreateOrConnectWithoutTransactionsInputSchema).optional(),
      upsert: z.lazy(() => OrderUpsertWithoutTransactionsInputSchema).optional(),
      connect: z.lazy(() => OrderWhereUniqueInputSchema).optional(),
      update: z
        .union([
          z.lazy(() => OrderUpdateToOneWithWhereWithoutTransactionsInputSchema),
          z.lazy(() => OrderUpdateWithoutTransactionsInputSchema),
          z.lazy(() => OrderUncheckedUpdateWithoutTransactionsInputSchema),
        ])
        .optional(),
    })
    .strict();

export default OrderUpdateOneRequiredWithoutTransactionsNestedInputSchema;
