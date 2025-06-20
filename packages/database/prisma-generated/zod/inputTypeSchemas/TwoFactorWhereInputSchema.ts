import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { UserScalarRelationFilterSchema } from './UserScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { BackupCodeListRelationFilterSchema } from './BackupCodeListRelationFilterSchema';

export const TwoFactorWhereInputSchema: z.ZodType<Prisma.TwoFactorWhereInput> = z.object({
  AND: z.union([ z.lazy(() => TwoFactorWhereInputSchema),z.lazy(() => TwoFactorWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TwoFactorWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TwoFactorWhereInputSchema),z.lazy(() => TwoFactorWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  secret: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  secretHash: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  enabled: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  verified: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  backupCodes: z.lazy(() => BackupCodeListRelationFilterSchema).optional()
}).strict();

export default TwoFactorWhereInputSchema;
