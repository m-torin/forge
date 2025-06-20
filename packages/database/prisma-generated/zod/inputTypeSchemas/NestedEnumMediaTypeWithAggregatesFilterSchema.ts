import type { Prisma } from '../../client';

import { z } from 'zod';
import { MediaTypeSchema } from './MediaTypeSchema';
import { NestedIntFilterSchema } from './NestedIntFilterSchema';
import { NestedEnumMediaTypeFilterSchema } from './NestedEnumMediaTypeFilterSchema';

export const NestedEnumMediaTypeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumMediaTypeWithAggregatesFilter> = z.object({
  equals: z.lazy(() => MediaTypeSchema).optional(),
  in: z.lazy(() => MediaTypeSchema).array().optional(),
  notIn: z.lazy(() => MediaTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => MediaTypeSchema),z.lazy(() => NestedEnumMediaTypeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumMediaTypeFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumMediaTypeFilterSchema).optional()
}).strict();

export default NestedEnumMediaTypeWithAggregatesFilterSchema;
