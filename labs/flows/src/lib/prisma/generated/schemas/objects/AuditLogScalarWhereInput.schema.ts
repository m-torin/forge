import { z } from 'zod';
import { StringFilterObjectSchema } from './StringFilter.schema';
import { JsonNullableFilterObjectSchema } from './JsonNullableFilter.schema';
import { DateTimeFilterObjectSchema } from './DateTimeFilter.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.AuditLogScalarWhereInput> = z
  .object({
    AND: z
      .union([
        z.lazy(() => AuditLogScalarWhereInputObjectSchema),
        z.lazy(() => AuditLogScalarWhereInputObjectSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => AuditLogScalarWhereInputObjectSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => AuditLogScalarWhereInputObjectSchema),
        z.lazy(() => AuditLogScalarWhereInputObjectSchema).array(),
      ])
      .optional(),
    id: z
      .union([z.lazy(() => StringFilterObjectSchema), z.string()])
      .optional(),
    entityType: z
      .union([z.lazy(() => StringFilterObjectSchema), z.string()])
      .optional(),
    entityId: z
      .union([z.lazy(() => StringFilterObjectSchema), z.string()])
      .optional(),
    flowId: z
      .union([z.lazy(() => StringFilterObjectSchema), z.string()])
      .optional(),
    changeType: z
      .union([z.lazy(() => StringFilterObjectSchema), z.string()])
      .optional(),
    before: z.lazy(() => JsonNullableFilterObjectSchema).optional(),
    after: z.lazy(() => JsonNullableFilterObjectSchema).optional(),
    userId: z
      .union([z.lazy(() => StringFilterObjectSchema), z.string()])
      .optional(),
    timestamp: z
      .union([z.lazy(() => DateTimeFilterObjectSchema), z.coerce.date()])
      .optional(),
  })
  .strict();

export const AuditLogScalarWhereInputObjectSchema = Schema;
