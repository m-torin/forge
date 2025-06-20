import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductTypeSchema } from './ProductTypeSchema';
import { NestedIntFilterSchema } from './NestedIntFilterSchema';
import { NestedEnumProductTypeFilterSchema } from './NestedEnumProductTypeFilterSchema';

export const NestedEnumProductTypeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumProductTypeWithAggregatesFilter> = z.object({
  equals: z.lazy(() => ProductTypeSchema).optional(),
  in: z.lazy(() => ProductTypeSchema).array().optional(),
  notIn: z.lazy(() => ProductTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => ProductTypeSchema),z.lazy(() => NestedEnumProductTypeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumProductTypeFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumProductTypeFilterSchema).optional()
}).strict();

export default NestedEnumProductTypeWithAggregatesFilterSchema;
