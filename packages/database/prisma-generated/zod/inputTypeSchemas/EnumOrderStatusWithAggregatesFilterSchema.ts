import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderStatusSchema } from './OrderStatusSchema';
import { NestedEnumOrderStatusWithAggregatesFilterSchema } from './NestedEnumOrderStatusWithAggregatesFilterSchema';
import { NestedIntFilterSchema } from './NestedIntFilterSchema';
import { NestedEnumOrderStatusFilterSchema } from './NestedEnumOrderStatusFilterSchema';

export const EnumOrderStatusWithAggregatesFilterSchema: z.ZodType<Prisma.EnumOrderStatusWithAggregatesFilter> = z.object({
  equals: z.lazy(() => OrderStatusSchema).optional(),
  in: z.lazy(() => OrderStatusSchema).array().optional(),
  notIn: z.lazy(() => OrderStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => OrderStatusSchema),z.lazy(() => NestedEnumOrderStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumOrderStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumOrderStatusFilterSchema).optional()
}).strict();

export default EnumOrderStatusWithAggregatesFilterSchema;
