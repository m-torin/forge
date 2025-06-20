import type { Prisma } from '../../client';

import { z } from 'zod';
import { RegistryUserJoinUserIdRegistryIdCompoundUniqueInputSchema } from './RegistryUserJoinUserIdRegistryIdCompoundUniqueInputSchema';
import { RegistryUserJoinWhereInputSchema } from './RegistryUserJoinWhereInputSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { EnumRegistryUserRoleFilterSchema } from './EnumRegistryUserRoleFilterSchema';
import { RegistryUserRoleSchema } from './RegistryUserRoleSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { UserScalarRelationFilterSchema } from './UserScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { RegistryScalarRelationFilterSchema } from './RegistryScalarRelationFilterSchema';
import { RegistryWhereInputSchema } from './RegistryWhereInputSchema';

export const RegistryUserJoinWhereUniqueInputSchema: z.ZodType<Prisma.RegistryUserJoinWhereUniqueInput> = z.union([
  z.object({
    id: z.string().cuid(),
    userId_registryId: z.lazy(() => RegistryUserJoinUserIdRegistryIdCompoundUniqueInputSchema)
  }),
  z.object({
    id: z.string().cuid(),
  }),
  z.object({
    userId_registryId: z.lazy(() => RegistryUserJoinUserIdRegistryIdCompoundUniqueInputSchema),
  }),
])
.and(z.object({
  id: z.string().cuid().optional(),
  userId_registryId: z.lazy(() => RegistryUserJoinUserIdRegistryIdCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => RegistryUserJoinWhereInputSchema),z.lazy(() => RegistryUserJoinWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => RegistryUserJoinWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => RegistryUserJoinWhereInputSchema),z.lazy(() => RegistryUserJoinWhereInputSchema).array() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  role: z.union([ z.lazy(() => EnumRegistryUserRoleFilterSchema),z.lazy(() => RegistryUserRoleSchema) ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  registryId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  registry: z.union([ z.lazy(() => RegistryScalarRelationFilterSchema),z.lazy(() => RegistryWhereInputSchema) ]).optional(),
}).strict());

export default RegistryUserJoinWhereUniqueInputSchema;
