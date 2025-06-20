import type { Prisma } from '../../client';

import { z } from 'zod';
import { BrandTypeSchema } from './BrandTypeSchema';
import { NestedIntFilterSchema } from './NestedIntFilterSchema';
import { NestedEnumBrandTypeFilterSchema } from './NestedEnumBrandTypeFilterSchema';

export const NestedEnumBrandTypeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumBrandTypeWithAggregatesFilter> = z.object({
  equals: z.lazy(() => BrandTypeSchema).optional(),
  in: z.lazy(() => BrandTypeSchema).array().optional(),
  notIn: z.lazy(() => BrandTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => BrandTypeSchema),z.lazy(() => NestedEnumBrandTypeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumBrandTypeFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumBrandTypeFilterSchema).optional()
}).strict();

export default NestedEnumBrandTypeWithAggregatesFilterSchema;
