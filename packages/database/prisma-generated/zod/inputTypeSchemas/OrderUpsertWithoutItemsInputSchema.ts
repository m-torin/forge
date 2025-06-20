import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderUpdateWithoutItemsInputSchema } from './OrderUpdateWithoutItemsInputSchema';
import { OrderUncheckedUpdateWithoutItemsInputSchema } from './OrderUncheckedUpdateWithoutItemsInputSchema';
import { OrderCreateWithoutItemsInputSchema } from './OrderCreateWithoutItemsInputSchema';
import { OrderUncheckedCreateWithoutItemsInputSchema } from './OrderUncheckedCreateWithoutItemsInputSchema';
import { OrderWhereInputSchema } from './OrderWhereInputSchema';

export const OrderUpsertWithoutItemsInputSchema: z.ZodType<Prisma.OrderUpsertWithoutItemsInput> = z.object({
  update: z.union([ z.lazy(() => OrderUpdateWithoutItemsInputSchema),z.lazy(() => OrderUncheckedUpdateWithoutItemsInputSchema) ]),
  create: z.union([ z.lazy(() => OrderCreateWithoutItemsInputSchema),z.lazy(() => OrderUncheckedCreateWithoutItemsInputSchema) ]),
  where: z.lazy(() => OrderWhereInputSchema).optional()
}).strict();

export default OrderUpsertWithoutItemsInputSchema;
