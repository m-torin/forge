import { z } from 'zod';
import type { Prisma } from '../../client';
import { OrderItemSelectSchema } from '../inputTypeSchemas/OrderItemSelectSchema';
import { OrderItemIncludeSchema } from '../inputTypeSchemas/OrderItemIncludeSchema';

export const OrderItemArgsSchema: z.ZodType<Prisma.OrderItemDefaultArgs> = z.object({
  select: z.lazy(() => OrderItemSelectSchema).optional(),
  include: z.lazy(() => OrderItemIncludeSchema).optional(),
}).strict();

export default OrderItemArgsSchema;
