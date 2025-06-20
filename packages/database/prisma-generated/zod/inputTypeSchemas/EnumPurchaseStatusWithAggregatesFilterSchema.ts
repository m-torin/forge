import type { Prisma } from '../../client';

import { z } from 'zod';
import { PurchaseStatusSchema } from './PurchaseStatusSchema';
import { NestedEnumPurchaseStatusWithAggregatesFilterSchema } from './NestedEnumPurchaseStatusWithAggregatesFilterSchema';
import { NestedIntFilterSchema } from './NestedIntFilterSchema';
import { NestedEnumPurchaseStatusFilterSchema } from './NestedEnumPurchaseStatusFilterSchema';

export const EnumPurchaseStatusWithAggregatesFilterSchema: z.ZodType<Prisma.EnumPurchaseStatusWithAggregatesFilter> = z.object({
  equals: z.lazy(() => PurchaseStatusSchema).optional(),
  in: z.lazy(() => PurchaseStatusSchema).array().optional(),
  notIn: z.lazy(() => PurchaseStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => PurchaseStatusSchema),z.lazy(() => NestedEnumPurchaseStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumPurchaseStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumPurchaseStatusFilterSchema).optional()
}).strict();

export default EnumPurchaseStatusWithAggregatesFilterSchema;
