import { z } from 'zod';
import { StringFilterObjectSchema } from './StringFilter.schema';
import { JsonNullableFilterObjectSchema } from './JsonNullableFilter.schema';
import { DateTimeFilterObjectSchema } from './DateTimeFilter.schema';
import { UserScalarRelationFilterObjectSchema } from './UserScalarRelationFilter.schema';
import { UserWhereInputObjectSchema } from './UserWhereInput.schema';
import { FlowScalarRelationFilterObjectSchema } from './FlowScalarRelationFilter.schema';
import { FlowWhereInputObjectSchema } from './FlowWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.AuditLogWhereInput> = z
  .object({
    AND: z
      .union([
        z.lazy(() => AuditLogWhereInputObjectSchema),
        z.lazy(() => AuditLogWhereInputObjectSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => AuditLogWhereInputObjectSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => AuditLogWhereInputObjectSchema),
        z.lazy(() => AuditLogWhereInputObjectSchema).array(),
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
    user: z
      .union([
        z.lazy(() => UserScalarRelationFilterObjectSchema),
        z.lazy(() => UserWhereInputObjectSchema),
      ])
      .optional(),
    flow: z
      .union([
        z.lazy(() => FlowScalarRelationFilterObjectSchema),
        z.lazy(() => FlowWhereInputObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const AuditLogWhereInputObjectSchema = Schema;
