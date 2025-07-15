import { z } from 'zod';
import { NullableJsonNullValueInputSchema } from '../enums/NullableJsonNullValueInput.schema';
import { UserCreateNestedOneWithoutAuditLogsInputObjectSchema } from './UserCreateNestedOneWithoutAuditLogsInput.schema';
import { FlowCreateNestedOneWithoutAuditLogsInputObjectSchema } from './FlowCreateNestedOneWithoutAuditLogsInput.schema';

import type { Prisma } from '@prisma/client';

const literalSchema = z.union([z.string(), z.number(), z.boolean()]);
const jsonSchema = z.lazy(() =>
  z.union([
    literalSchema,
    z.array(jsonSchema.nullable()),
    z.record(z.string(), jsonSchema.nullable()),
  ]),
);

const Schema: z.ZodType<any> = z
  .object({
    id: z.string().optional(),
    entityType: z.string(),
    entityId: z.string(),
    changeType: z.string(),
    before: z.union([NullableJsonNullValueInputSchema, jsonSchema]).optional(),
    after: z.union([NullableJsonNullValueInputSchema, jsonSchema]).optional(),
    timestamp: z.coerce.date().optional(),
    user: z.lazy(() => UserCreateNestedOneWithoutAuditLogsInputObjectSchema),
    flow: z.lazy(() => FlowCreateNestedOneWithoutAuditLogsInputObjectSchema),
  })
  .strict();

export const AuditLogCreateInputObjectSchema = Schema;
