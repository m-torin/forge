import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderItemWhereUniqueInputSchema } from './OrderItemWhereUniqueInputSchema';
import { OrderItemCreateWithoutOrderInputSchema } from './OrderItemCreateWithoutOrderInputSchema';
import { OrderItemUncheckedCreateWithoutOrderInputSchema } from './OrderItemUncheckedCreateWithoutOrderInputSchema';

export const OrderItemCreateOrConnectWithoutOrderInputSchema: z.ZodType<Prisma.OrderItemCreateOrConnectWithoutOrderInput> = z.object({
  where: z.lazy(() => OrderItemWhereUniqueInputSchema),
  create: z.union([ z.lazy(() => OrderItemCreateWithoutOrderInputSchema),z.lazy(() => OrderItemUncheckedCreateWithoutOrderInputSchema) ]),
}).strict();

export default OrderItemCreateOrConnectWithoutOrderInputSchema;
