import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { EnumRegistryUserRoleFilterSchema } from './EnumRegistryUserRoleFilterSchema';
import { RegistryUserRoleSchema } from './RegistryUserRoleSchema';
import { UserScalarRelationFilterSchema } from './UserScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { RegistryScalarRelationFilterSchema } from './RegistryScalarRelationFilterSchema';
import { RegistryWhereInputSchema } from './RegistryWhereInputSchema';

export const RegistryUserJoinWhereInputSchema: z.ZodType<Prisma.RegistryUserJoinWhereInput> = z
  .object({
    AND: z
      .union([
        z.lazy(() => RegistryUserJoinWhereInputSchema),
        z.lazy(() => RegistryUserJoinWhereInputSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => RegistryUserJoinWhereInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => RegistryUserJoinWhereInputSchema),
        z.lazy(() => RegistryUserJoinWhereInputSchema).array(),
      ])
      .optional(),
    id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    role: z
      .union([z.lazy(() => EnumRegistryUserRoleFilterSchema), z.lazy(() => RegistryUserRoleSchema)])
      .optional(),
    userId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    registryId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    user: z
      .union([z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema)])
      .optional(),
    registry: z
      .union([
        z.lazy(() => RegistryScalarRelationFilterSchema),
        z.lazy(() => RegistryWhereInputSchema),
      ])
      .optional(),
  })
  .strict();

export default RegistryUserJoinWhereInputSchema;
