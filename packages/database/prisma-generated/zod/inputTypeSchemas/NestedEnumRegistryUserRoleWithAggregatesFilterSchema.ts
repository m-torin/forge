import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryUserRoleSchema } from './RegistryUserRoleSchema';
import { NestedIntFilterSchema } from './NestedIntFilterSchema';
import { NestedEnumRegistryUserRoleFilterSchema } from './NestedEnumRegistryUserRoleFilterSchema';

export const NestedEnumRegistryUserRoleWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumRegistryUserRoleWithAggregatesFilter> = z.object({
  equals: z.lazy(() => RegistryUserRoleSchema).optional(),
  in: z.lazy(() => RegistryUserRoleSchema).array().optional(),
  notIn: z.lazy(() => RegistryUserRoleSchema).array().optional(),
  not: z.union([ z.lazy(() => RegistryUserRoleSchema),z.lazy(() => NestedEnumRegistryUserRoleWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumRegistryUserRoleFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumRegistryUserRoleFilterSchema).optional()
}).strict();

export default NestedEnumRegistryUserRoleWithAggregatesFilterSchema;
