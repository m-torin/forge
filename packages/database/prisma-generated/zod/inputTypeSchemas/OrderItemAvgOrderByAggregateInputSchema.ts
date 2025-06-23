import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const OrderItemAvgOrderByAggregateInputSchema: z.ZodType<Prisma.OrderItemAvgOrderByAggregateInput> =
  z
    .object({
      quantity: z.lazy(() => SortOrderSchema).optional(),
      price: z.lazy(() => SortOrderSchema).optional(),
      total: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export default OrderItemAvgOrderByAggregateInputSchema;
