import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';

export const MemberScalarWhereInputSchema: z.ZodType<Prisma.MemberScalarWhereInput> = z
  .object({
    AND: z
      .union([
        z.lazy(() => MemberScalarWhereInputSchema),
        z.lazy(() => MemberScalarWhereInputSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => MemberScalarWhereInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => MemberScalarWhereInputSchema),
        z.lazy(() => MemberScalarWhereInputSchema).array(),
      ])
      .optional(),
    id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    userId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    organizationId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    role: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    updatedAt: z
      .union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
      .optional()
      .nullable(),
  })
  .strict();

export default MemberScalarWhereInputSchema;
