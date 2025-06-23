import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderItemWhereInputSchema } from './OrderItemWhereInputSchema';

export const OrderItemListRelationFilterSchema: z.ZodType<Prisma.OrderItemListRelationFilter> = z
  .object({
    every: z.lazy(() => OrderItemWhereInputSchema).optional(),
    some: z.lazy(() => OrderItemWhereInputSchema).optional(),
    none: z.lazy(() => OrderItemWhereInputSchema).optional(),
  })
  .strict();

export default OrderItemListRelationFilterSchema;
