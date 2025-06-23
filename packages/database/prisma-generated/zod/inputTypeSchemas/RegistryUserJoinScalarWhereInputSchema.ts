import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { EnumRegistryUserRoleFilterSchema } from './EnumRegistryUserRoleFilterSchema';
import { RegistryUserRoleSchema } from './RegistryUserRoleSchema';

export const RegistryUserJoinScalarWhereInputSchema: z.ZodType<Prisma.RegistryUserJoinScalarWhereInput> =
  z
    .object({
      AND: z
        .union([
          z.lazy(() => RegistryUserJoinScalarWhereInputSchema),
          z.lazy(() => RegistryUserJoinScalarWhereInputSchema).array(),
        ])
        .optional(),
      OR: z
        .lazy(() => RegistryUserJoinScalarWhereInputSchema)
        .array()
        .optional(),
      NOT: z
        .union([
          z.lazy(() => RegistryUserJoinScalarWhereInputSchema),
          z.lazy(() => RegistryUserJoinScalarWhereInputSchema).array(),
        ])
        .optional(),
      id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
      createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
      updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
      role: z
        .union([
          z.lazy(() => EnumRegistryUserRoleFilterSchema),
          z.lazy(() => RegistryUserRoleSchema),
        ])
        .optional(),
      userId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
      registryId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    })
    .strict();

export default RegistryUserJoinScalarWhereInputSchema;
