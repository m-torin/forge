import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';

export const TeamMemberScalarWhereInputSchema: z.ZodType<Prisma.TeamMemberScalarWhereInput> = z
  .object({
    AND: z
      .union([
        z.lazy(() => TeamMemberScalarWhereInputSchema),
        z.lazy(() => TeamMemberScalarWhereInputSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => TeamMemberScalarWhereInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => TeamMemberScalarWhereInputSchema),
        z.lazy(() => TeamMemberScalarWhereInputSchema).array(),
      ])
      .optional(),
    id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    userId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    teamId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    role: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
  })
  .strict();

export default TeamMemberScalarWhereInputSchema;
