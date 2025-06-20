import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderItemWhereUniqueInputSchema } from './OrderItemWhereUniqueInputSchema';
import { OrderItemUpdateWithoutProductInputSchema } from './OrderItemUpdateWithoutProductInputSchema';
import { OrderItemUncheckedUpdateWithoutProductInputSchema } from './OrderItemUncheckedUpdateWithoutProductInputSchema';

export const OrderItemUpdateWithWhereUniqueWithoutProductInputSchema: z.ZodType<Prisma.OrderItemUpdateWithWhereUniqueWithoutProductInput> = z.object({
  where: z.lazy(() => OrderItemWhereUniqueInputSchema),
  data: z.union([ z.lazy(() => OrderItemUpdateWithoutProductInputSchema),z.lazy(() => OrderItemUncheckedUpdateWithoutProductInputSchema) ]),
}).strict();

export default OrderItemUpdateWithWhereUniqueWithoutProductInputSchema;
