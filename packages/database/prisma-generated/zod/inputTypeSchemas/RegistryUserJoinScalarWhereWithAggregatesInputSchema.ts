import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { DateTimeWithAggregatesFilterSchema } from './DateTimeWithAggregatesFilterSchema';
import { EnumRegistryUserRoleWithAggregatesFilterSchema } from './EnumRegistryUserRoleWithAggregatesFilterSchema';
import { RegistryUserRoleSchema } from './RegistryUserRoleSchema';

export const RegistryUserJoinScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.RegistryUserJoinScalarWhereWithAggregatesInput> =
  z
    .object({
      AND: z
        .union([
          z.lazy(() => RegistryUserJoinScalarWhereWithAggregatesInputSchema),
          z.lazy(() => RegistryUserJoinScalarWhereWithAggregatesInputSchema).array(),
        ])
        .optional(),
      OR: z
        .lazy(() => RegistryUserJoinScalarWhereWithAggregatesInputSchema)
        .array()
        .optional(),
      NOT: z
        .union([
          z.lazy(() => RegistryUserJoinScalarWhereWithAggregatesInputSchema),
          z.lazy(() => RegistryUserJoinScalarWhereWithAggregatesInputSchema).array(),
        ])
        .optional(),
      id: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
      createdAt: z
        .union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()])
        .optional(),
      updatedAt: z
        .union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()])
        .optional(),
      role: z
        .union([
          z.lazy(() => EnumRegistryUserRoleWithAggregatesFilterSchema),
          z.lazy(() => RegistryUserRoleSchema),
        ])
        .optional(),
      userId: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
      registryId: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
    })
    .strict();

export default RegistryUserJoinScalarWhereWithAggregatesInputSchema;
