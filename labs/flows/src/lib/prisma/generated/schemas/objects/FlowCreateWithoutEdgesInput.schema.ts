import { z } from 'zod';
import { FlowMethodSchema } from '../enums/FlowMethod.schema';
import { NullableJsonNullValueInputSchema } from '../enums/NullableJsonNullValueInput.schema';
import { FlowRunCreateNestedManyWithoutFlowInputObjectSchema } from './FlowRunCreateNestedManyWithoutFlowInput.schema';
import { FlowEventCreateNestedManyWithoutFlowInputObjectSchema } from './FlowEventCreateNestedManyWithoutFlowInput.schema';
import { InstanceCreateNestedOneWithoutFlowsInputObjectSchema } from './InstanceCreateNestedOneWithoutFlowsInput.schema';
import { NodeCreateNestedManyWithoutFlowInputObjectSchema } from './NodeCreateNestedManyWithoutFlowInput.schema';
import { SecretCreateNestedManyWithoutFlowInputObjectSchema } from './SecretCreateNestedManyWithoutFlowInput.schema';
import { TagCreateNestedManyWithoutFlowInputObjectSchema } from './TagCreateNestedManyWithoutFlowInput.schema';
import { TestCaseCreateNestedManyWithoutFlowInputObjectSchema } from './TestCaseCreateNestedManyWithoutFlowInput.schema';
import { AuditLogCreateNestedManyWithoutFlowInputObjectSchema } from './AuditLogCreateNestedManyWithoutFlowInput.schema';
import { FlowStatisticsCreateNestedOneWithoutFlowInputObjectSchema } from './FlowStatisticsCreateNestedOneWithoutFlowInput.schema';

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
    flowRuns: z
      .lazy(() => FlowRunCreateNestedManyWithoutFlowInputObjectSchema)
      .optional(),
    flowEvents: z
      .lazy(() => FlowEventCreateNestedManyWithoutFlowInputObjectSchema)
      .optional(),
    instance: z.lazy(
      () => InstanceCreateNestedOneWithoutFlowsInputObjectSchema,
    ),
    nodes: z
      .lazy(() => NodeCreateNestedManyWithoutFlowInputObjectSchema)
      .optional(),
    secrets: z
      .lazy(() => SecretCreateNestedManyWithoutFlowInputObjectSchema)
      .optional(),
    tags: z
      .lazy(() => TagCreateNestedManyWithoutFlowInputObjectSchema)
      .optional(),
    testCases: z
      .lazy(() => TestCaseCreateNestedManyWithoutFlowInputObjectSchema)
      .optional(),
    auditLogs: z
      .lazy(() => AuditLogCreateNestedManyWithoutFlowInputObjectSchema)
      .optional(),
    statistics: z
      .lazy(() => FlowStatisticsCreateNestedOneWithoutFlowInputObjectSchema)
      .optional(),
  })
  .strict();

export const FlowCreateWithoutEdgesInputObjectSchema = Schema;
