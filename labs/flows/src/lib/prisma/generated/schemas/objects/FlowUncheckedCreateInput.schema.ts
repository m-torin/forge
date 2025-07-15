import { z } from 'zod';
import { FlowMethodSchema } from '../enums/FlowMethod.schema';
import { NullableJsonNullValueInputSchema } from '../enums/NullableJsonNullValueInput.schema';
import { EdgeUncheckedCreateNestedManyWithoutFlowInputObjectSchema } from './EdgeUncheckedCreateNestedManyWithoutFlowInput.schema';
import { FlowRunUncheckedCreateNestedManyWithoutFlowInputObjectSchema } from './FlowRunUncheckedCreateNestedManyWithoutFlowInput.schema';
import { FlowEventUncheckedCreateNestedManyWithoutFlowInputObjectSchema } from './FlowEventUncheckedCreateNestedManyWithoutFlowInput.schema';
import { NodeUncheckedCreateNestedManyWithoutFlowInputObjectSchema } from './NodeUncheckedCreateNestedManyWithoutFlowInput.schema';
import { SecretUncheckedCreateNestedManyWithoutFlowInputObjectSchema } from './SecretUncheckedCreateNestedManyWithoutFlowInput.schema';
import { TagUncheckedCreateNestedManyWithoutFlowInputObjectSchema } from './TagUncheckedCreateNestedManyWithoutFlowInput.schema';
import { TestCaseUncheckedCreateNestedManyWithoutFlowInputObjectSchema } from './TestCaseUncheckedCreateNestedManyWithoutFlowInput.schema';
import { AuditLogUncheckedCreateNestedManyWithoutFlowInputObjectSchema } from './AuditLogUncheckedCreateNestedManyWithoutFlowInput.schema';
import { FlowStatisticsUncheckedCreateNestedOneWithoutFlowInputObjectSchema } from './FlowStatisticsUncheckedCreateNestedOneWithoutFlowInput.schema';

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
    createdAt: z.coerce.date().optional(),
    id: z.string().optional(),
    instanceId: z.string(),
    isEnabled: z.boolean().optional(),
    method: FlowMethodSchema.optional(),
    name: z.string(),
    metadata: z
      .union([NullableJsonNullValueInputSchema, jsonSchema])
      .optional(),
    updatedAt: z.coerce.date().optional(),
    viewport: z
      .union([NullableJsonNullValueInputSchema, jsonSchema])
      .optional(),
    deleted: z.boolean().optional(),
    edges: z
      .lazy(() => EdgeUncheckedCreateNestedManyWithoutFlowInputObjectSchema)
      .optional(),
    flowRuns: z
      .lazy(() => FlowRunUncheckedCreateNestedManyWithoutFlowInputObjectSchema)
      .optional(),
    flowEvents: z
      .lazy(
        () => FlowEventUncheckedCreateNestedManyWithoutFlowInputObjectSchema,
      )
      .optional(),
    nodes: z
      .lazy(() => NodeUncheckedCreateNestedManyWithoutFlowInputObjectSchema)
      .optional(),
    secrets: z
      .lazy(() => SecretUncheckedCreateNestedManyWithoutFlowInputObjectSchema)
      .optional(),
    tags: z
      .lazy(() => TagUncheckedCreateNestedManyWithoutFlowInputObjectSchema)
      .optional(),
    testCases: z
      .lazy(() => TestCaseUncheckedCreateNestedManyWithoutFlowInputObjectSchema)
      .optional(),
    auditLogs: z
      .lazy(() => AuditLogUncheckedCreateNestedManyWithoutFlowInputObjectSchema)
      .optional(),
    statistics: z
      .lazy(
        () =>
          FlowStatisticsUncheckedCreateNestedOneWithoutFlowInputObjectSchema,
      )
      .optional(),
  })
  .strict();

export const FlowUncheckedCreateInputObjectSchema = Schema;
