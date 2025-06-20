import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderItemStatusSchema } from './OrderItemStatusSchema';
import { NestedIntFilterSchema } from './NestedIntFilterSchema';
import { NestedEnumOrderItemStatusFilterSchema } from './NestedEnumOrderItemStatusFilterSchema';

export const NestedEnumOrderItemStatusWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumOrderItemStatusWithAggregatesFilter> = z.object({
  equals: z.lazy(() => OrderItemStatusSchema).optional(),
  in: z.lazy(() => OrderItemStatusSchema).array().optional(),
  notIn: z.lazy(() => OrderItemStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => OrderItemStatusSchema),z.lazy(() => NestedEnumOrderItemStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumOrderItemStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumOrderItemStatusFilterSchema).optional()
}).strict();

export default NestedEnumOrderItemStatusWithAggregatesFilterSchema;
