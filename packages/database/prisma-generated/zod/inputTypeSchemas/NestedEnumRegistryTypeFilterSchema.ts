import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryTypeSchema } from './RegistryTypeSchema';

export const NestedEnumRegistryTypeFilterSchema: z.ZodType<Prisma.NestedEnumRegistryTypeFilter> = z.object({
  equals: z.lazy(() => RegistryTypeSchema).optional(),
  in: z.lazy(() => RegistryTypeSchema).array().optional(),
  notIn: z.lazy(() => RegistryTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => RegistryTypeSchema),z.lazy(() => NestedEnumRegistryTypeFilterSchema) ]).optional(),
}).strict();

export default NestedEnumRegistryTypeFilterSchema;
