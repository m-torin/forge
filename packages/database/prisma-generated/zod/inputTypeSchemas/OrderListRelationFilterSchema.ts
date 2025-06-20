import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderWhereInputSchema } from './OrderWhereInputSchema';

export const OrderListRelationFilterSchema: z.ZodType<Prisma.OrderListRelationFilter> = z.object({
  every: z.lazy(() => OrderWhereInputSchema).optional(),
  some: z.lazy(() => OrderWhereInputSchema).optional(),
  none: z.lazy(() => OrderWhereInputSchema).optional()
}).strict();

export default OrderListRelationFilterSchema;
