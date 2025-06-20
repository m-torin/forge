import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryUserRoleSchema } from './RegistryUserRoleSchema';
import { NestedEnumRegistryUserRoleFilterSchema } from './NestedEnumRegistryUserRoleFilterSchema';

export const EnumRegistryUserRoleFilterSchema: z.ZodType<Prisma.EnumRegistryUserRoleFilter> = z.object({
  equals: z.lazy(() => RegistryUserRoleSchema).optional(),
  in: z.lazy(() => RegistryUserRoleSchema).array().optional(),
  notIn: z.lazy(() => RegistryUserRoleSchema).array().optional(),
  not: z.union([ z.lazy(() => RegistryUserRoleSchema),z.lazy(() => NestedEnumRegistryUserRoleFilterSchema) ]).optional(),
}).strict();

export default EnumRegistryUserRoleFilterSchema;
