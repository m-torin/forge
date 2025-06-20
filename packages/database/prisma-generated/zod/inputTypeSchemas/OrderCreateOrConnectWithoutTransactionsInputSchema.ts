import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderWhereUniqueInputSchema } from './OrderWhereUniqueInputSchema';
import { OrderCreateWithoutTransactionsInputSchema } from './OrderCreateWithoutTransactionsInputSchema';
import { OrderUncheckedCreateWithoutTransactionsInputSchema } from './OrderUncheckedCreateWithoutTransactionsInputSchema';

export const OrderCreateOrConnectWithoutTransactionsInputSchema: z.ZodType<Prisma.OrderCreateOrConnectWithoutTransactionsInput> = z.object({
  where: z.lazy(() => OrderWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => OrderCreateWithoutTransactionsInputSchema),z.lazy(() => OrderUncheckedCreateWithoutTransactionsInputSchema) ]),
}).strict();

export default OrderCreateOrConnectWithoutTransactionsInputSchema;
