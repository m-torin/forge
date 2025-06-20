import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryUserRoleSchema } from './RegistryUserRoleSchema';

export const NestedEnumRegistryUserRoleFilterSchema: z.ZodType<Prisma.NestedEnumRegistryUserRoleFilter> = z.object({
  equals: z.lazy(() => RegistryUserRoleSchema).optional(),
  in: z.lazy(() => RegistryUserRoleSchema).array().optional(),
  notIn: z.lazy(() => RegistryUserRoleSchema).array().optional(),
  not: z.union([ z.lazy(() => RegistryUserRoleSchema),z.lazy(() => NestedEnumRegistryUserRoleFilterSchema) ]).optional(),
}).strict();

export default NestedEnumRegistryUserRoleFilterSchema;
