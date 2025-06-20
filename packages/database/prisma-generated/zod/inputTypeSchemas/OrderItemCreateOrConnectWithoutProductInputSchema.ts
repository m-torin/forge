import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderItemWhereUniqueInputSchema } from './OrderItemWhereUniqueInputSchema';
import { OrderItemCreateWithoutProductInputSchema } from './OrderItemCreateWithoutProductInputSchema';
import { OrderItemUncheckedCreateWithoutProductInputSchema } from './OrderItemUncheckedCreateWithoutProductInputSchema';

export const OrderItemCreateOrConnectWithoutProductInputSchema: z.ZodType<Prisma.OrderItemCreateOrConnectWithoutProductInput> = z.object({
  where: z.lazy(() => OrderItemWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => OrderItemCreateWithoutProductInputSchema),z.lazy(() => OrderItemUncheckedCreateWithoutProductInputSchema) ]),
}).strict();

export default OrderItemCreateOrConnectWithoutProductInputSchema;
