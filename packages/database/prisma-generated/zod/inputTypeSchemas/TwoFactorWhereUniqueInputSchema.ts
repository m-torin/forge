import type { Prisma } from '../../client';

import { z } from 'zod';
import { TwoFactorWhereInputSchema } from './TwoFactorWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { UserScalarRelationFilterSchema } from './UserScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { BackupCodeListRelationFilterSchema } from './BackupCodeListRelationFilterSchema';

export const TwoFactorWhereUniqueInputSchema: z.ZodType<Prisma.TwoFactorWhereUniqueInput> = z.union([
  z.object({
    id: z.string(),
    userId: z.string()
  }),
  z.object({
    id: z.string(),
  }),
  z.object({
    userId: z.string(),
  }),
])
.and(z.object({
  id: z.string().optional(),
  userId: z.string().optional(),
  AND: z.union([ z.lazy(() => TwoFactorWhereInputSchema),z.lazy(() => TwoFactorWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => TwoFactorWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => TwoFactorWhereInputSchema),z.lazy(() => TwoFactorWhereInputSchema).array() ]).optional(),
  secret: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  secretHash: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  enabled: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  verified: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  backupCodes: z.lazy(() => BackupCodeListRelationFilterSchema).optional()
}).strict());

export default TwoFactorWhereUniqueInputSchema;
