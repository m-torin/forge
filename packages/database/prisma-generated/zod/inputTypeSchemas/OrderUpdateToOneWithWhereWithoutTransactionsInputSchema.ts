import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderWhereInputSchema } from './OrderWhereInputSchema';
import { OrderUpdateWithoutTransactionsInputSchema } from './OrderUpdateWithoutTransactionsInputSchema';
import { OrderUncheckedUpdateWithoutTransactionsInputSchema } from './OrderUncheckedUpdateWithoutTransactionsInputSchema';

export const OrderUpdateToOneWithWhereWithoutTransactionsInputSchema: z.ZodType<Prisma.OrderUpdateToOneWithWhereWithoutTransactionsInput> = z.object({
  where: z.lazy(() => OrderWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => OrderUpdateWithoutTransactionsInputSchema),z.lazy(() => OrderUncheckedUpdateWithoutTransactionsInputSchema) ]),
}).strict();

export default OrderUpdateToOneWithWhereWithoutTransactionsInputSchema;
