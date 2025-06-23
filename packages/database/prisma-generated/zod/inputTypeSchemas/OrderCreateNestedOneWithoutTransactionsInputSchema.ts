import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderCreateWithoutTransactionsInputSchema } from './OrderCreateWithoutTransactionsInputSchema';
import { OrderUncheckedCreateWithoutTransactionsInputSchema } from './OrderUncheckedCreateWithoutTransactionsInputSchema';
import { OrderCreateOrConnectWithoutTransactionsInputSchema } from './OrderCreateOrConnectWithoutTransactionsInputSchema';
import { OrderWhereUniqueInputSchema } from './OrderWhereUniqueInputSchema';

export const OrderCreateNestedOneWithoutTransactionsInputSchema: z.ZodType<Prisma.OrderCreateNestedOneWithoutTransactionsInput> =
  z
    .object({
      create: z
        .union([
          z.lazy(() => OrderCreateWithoutTransactionsInputSchema),
          z.lazy(() => OrderUncheckedCreateWithoutTransactionsInputSchema),
        ])
        .optional(),
      connectOrCreate: z.lazy(() => OrderCreateOrConnectWithoutTransactionsInputSchema).optional(),
      connect: z.lazy(() => OrderWhereUniqueInputSchema).optional(),
    })
    .strict();

export default OrderCreateNestedOneWithoutTransactionsInputSchema;
