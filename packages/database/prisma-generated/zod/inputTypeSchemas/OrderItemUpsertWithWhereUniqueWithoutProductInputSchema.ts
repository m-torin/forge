import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderItemWhereUniqueInputSchema } from './OrderItemWhereUniqueInputSchema';
import { OrderItemUpdateWithoutProductInputSchema } from './OrderItemUpdateWithoutProductInputSchema';
import { OrderItemUncheckedUpdateWithoutProductInputSchema } from './OrderItemUncheckedUpdateWithoutProductInputSchema';
import { OrderItemCreateWithoutProductInputSchema } from './OrderItemCreateWithoutProductInputSchema';
import { OrderItemUncheckedCreateWithoutProductInputSchema } from './OrderItemUncheckedCreateWithoutProductInputSchema';

export const OrderItemUpsertWithWhereUniqueWithoutProductInputSchema: z.ZodType<Prisma.OrderItemUpsertWithWhereUniqueWithoutProductInput> = z.object({
  where: z.lazy(() => OrderItemWhereUniqueInputSchema),
  update: z.union([ z.lazy(() => OrderItemUpdateWithoutProductInputSchema),z.lazy(() => OrderItemUncheckedUpdateWithoutProductInputSchema) ]),
  create: z.union([ z.lazy(() => OrderItemCreateWithoutProductInputSchema),z.lazy(() => OrderItemUncheckedCreateWithoutProductInputSchema) ]),
}).strict();

export default OrderItemUpsertWithWhereUniqueWithoutProductInputSchema;
