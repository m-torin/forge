import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductStatusSchema } from './ProductStatusSchema';
import { NestedEnumProductStatusWithAggregatesFilterSchema } from './NestedEnumProductStatusWithAggregatesFilterSchema';
import { NestedIntFilterSchema } from './NestedIntFilterSchema';
import { NestedEnumProductStatusFilterSchema } from './NestedEnumProductStatusFilterSchema';

export const EnumProductStatusWithAggregatesFilterSchema: z.ZodType<Prisma.EnumProductStatusWithAggregatesFilter> = z.object({
  equals: z.lazy(() => ProductStatusSchema).optional(),
  in: z.lazy(() => ProductStatusSchema).array().optional(),
  notIn: z.lazy(() => ProductStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => ProductStatusSchema),z.lazy(() => NestedEnumProductStatusWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumProductStatusFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumProductStatusFilterSchema).optional()
}).strict();

export default EnumProductStatusWithAggregatesFilterSchema;
