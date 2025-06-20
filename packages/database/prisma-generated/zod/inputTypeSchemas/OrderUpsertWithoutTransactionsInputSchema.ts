import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderUpdateWithoutTransactionsInputSchema } from './OrderUpdateWithoutTransactionsInputSchema';
import { OrderUncheckedUpdateWithoutTransactionsInputSchema } from './OrderUncheckedUpdateWithoutTransactionsInputSchema';
import { OrderCreateWithoutTransactionsInputSchema } from './OrderCreateWithoutTransactionsInputSchema';
import { OrderUncheckedCreateWithoutTransactionsInputSchema } from './OrderUncheckedCreateWithoutTransactionsInputSchema';
import { OrderWhereInputSchema } from './OrderWhereInputSchema';

export const OrderUpsertWithoutTransactionsInputSchema: z.ZodType<Prisma.OrderUpsertWithoutTransactionsInput> = z.object({
  update: z.union([ z.lazy(() => OrderUpdateWithoutTransactionsInputSchema),z.lazy(() => OrderUncheckedUpdateWithoutTransactionsInputSchema) ]),
  create: z.union([ z.lazy(() => OrderCreateWithoutTransactionsInputSchema),z.lazy(() => OrderUncheckedCreateWithoutTransactionsInputSchema) ]),
  where: z.lazy(() => OrderWhereInputSchema).optional()
}).strict();

export default OrderUpsertWithoutTransactionsInputSchema;
