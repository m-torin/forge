import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderWhereInputSchema } from './OrderWhereInputSchema';
import { OrderUpdateWithoutItemsInputSchema } from './OrderUpdateWithoutItemsInputSchema';
import { OrderUncheckedUpdateWithoutItemsInputSchema } from './OrderUncheckedUpdateWithoutItemsInputSchema';

export const OrderUpdateToOneWithWhereWithoutItemsInputSchema: z.ZodType<Prisma.OrderUpdateToOneWithWhereWithoutItemsInput> = z.object({
  where: z.lazy(() => OrderWhereInputSchema).optional(),
  data: z.union([ z.lazy(() => OrderUpdateWithoutItemsInputSchema),z.lazy(() => OrderUncheckedUpdateWithoutItemsInputSchema) ]),
}).strict();

export default OrderUpdateToOneWithWhereWithoutItemsInputSchema;
