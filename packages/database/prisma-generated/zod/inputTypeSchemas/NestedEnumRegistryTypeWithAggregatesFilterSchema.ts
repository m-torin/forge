import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryTypeSchema } from './RegistryTypeSchema';
import { NestedIntFilterSchema } from './NestedIntFilterSchema';
import { NestedEnumRegistryTypeFilterSchema } from './NestedEnumRegistryTypeFilterSchema';

export const NestedEnumRegistryTypeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumRegistryTypeWithAggregatesFilter> = z.object({
  equals: z.lazy(() => RegistryTypeSchema).optional(),
  in: z.lazy(() => RegistryTypeSchema).array().optional(),
  notIn: z.lazy(() => RegistryTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => RegistryTypeSchema),z.lazy(() => NestedEnumRegistryTypeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumRegistryTypeFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumRegistryTypeFilterSchema).optional()
}).strict();

export default NestedEnumRegistryTypeWithAggregatesFilterSchema;
