import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';

export const BackupCodeScalarWhereInputSchema: z.ZodType<Prisma.BackupCodeScalarWhereInput> = z.object({
  AND: z.union([ z.lazy(() => BackupCodeScalarWhereInputSchema),z.lazy(() => BackupCodeScalarWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => BackupCodeScalarWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => BackupCodeScalarWhereInputSchema),z.lazy(() => BackupCodeScalarWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  code: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  codeHash: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  twoFactorId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  used: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  usedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
}).strict();

export default BackupCodeScalarWhereInputSchema;
