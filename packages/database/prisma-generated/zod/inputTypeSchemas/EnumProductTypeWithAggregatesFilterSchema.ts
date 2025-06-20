import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductTypeSchema } from './ProductTypeSchema';
import { NestedEnumProductTypeWithAggregatesFilterSchema } from './NestedEnumProductTypeWithAggregatesFilterSchema';
import { NestedIntFilterSchema } from './NestedIntFilterSchema';
import { NestedEnumProductTypeFilterSchema } from './NestedEnumProductTypeFilterSchema';

export const EnumProductTypeWithAggregatesFilterSchema: z.ZodType<Prisma.EnumProductTypeWithAggregatesFilter> = z.object({
  equals: z.lazy(() => ProductTypeSchema).optional(),
  in: z.lazy(() => ProductTypeSchema).array().optional(),
  notIn: z.lazy(() => ProductTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => ProductTypeSchema),z.lazy(() => NestedEnumProductTypeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumProductTypeFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumProductTypeFilterSchema).optional()
}).strict();

export default EnumProductTypeWithAggregatesFilterSchema;
