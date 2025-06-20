import type { Prisma } from '../../client';

import { z } from 'zod';
import { OrderItemStatusSchema } from './OrderItemStatusSchema';
import { NestedEnumOrderItemStatusFilterSchema } from './NestedEnumOrderItemStatusFilterSchema';

export const EnumOrderItemStatusFilterSchema: z.ZodType<Prisma.EnumOrderItemStatusFilter> = z.object({
  equals: z.lazy(() => OrderItemStatusSchema).optional(),
  in: z.lazy(() => OrderItemStatusSchema).array().optional(),
  notIn: z.lazy(() => OrderItemStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => OrderItemStatusSchema),z.lazy(() => NestedEnumOrderItemStatusFilterSchema) ]).optional(),
}).strict();

export default EnumOrderItemStatusFilterSchema;
