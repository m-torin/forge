import { z } from 'zod';
import { DateTimeFilterObjectSchema } from './DateTimeFilter.schema';
import { StringFilterObjectSchema } from './StringFilter.schema';
import { BoolFilterObjectSchema } from './BoolFilter.schema';
import { EnumFlowMethodFilterObjectSchema } from './EnumFlowMethodFilter.schema';
import { FlowMethodSchema } from '../enums/FlowMethod.schema';
import { JsonNullableFilterObjectSchema } from './JsonNullableFilter.schema';
import { EdgeListRelationFilterObjectSchema } from './EdgeListRelationFilter.schema';
import { FlowRunListRelationFilterObjectSchema } from './FlowRunListRelationFilter.schema';
import { FlowEventListRelationFilterObjectSchema } from './FlowEventListRelationFilter.schema';
import { InstanceScalarRelationFilterObjectSchema } from './InstanceScalarRelationFilter.schema';
import { InstanceWhereInputObjectSchema } from './InstanceWhereInput.schema';
import { NodeListRelationFilterObjectSchema } from './NodeListRelationFilter.schema';
import { SecretListRelationFilterObjectSchema } from './SecretListRelationFilter.schema';
import { TagListRelationFilterObjectSchema } from './TagListRelationFilter.schema';
import { TestCaseListRelationFilterObjectSchema } from './TestCaseListRelationFilter.schema';
import { AuditLogListRelationFilterObjectSchema } from './AuditLogListRelationFilter.schema';
import { FlowStatisticsNullableScalarRelationFilterObjectSchema } from './FlowStatisticsNullableScalarRelationFilter.schema';
import { FlowStatisticsWhereInputObjectSchema } from './FlowStatisticsWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.FlowWhereInput> = z
  .object({
    AND: z
      .union([
        z.lazy(() => FlowWhereInputObjectSchema),
        z.lazy(() => FlowWhereInputObjectSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => FlowWhereInputObjectSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => FlowWhereInputObjectSchema),
        z.lazy(() => FlowWhereInputObjectSchema).array(),
      ])
      .optional(),
    createdAt: z
      .union([z.lazy(() => DateTimeFilterObjectSchema), z.coerce.date()])
      .optional(),
    id: z
      .union([z.lazy(() => StringFilterObjectSchema), z.string()])
      .optional(),
    instanceId: z
      .union([z.lazy(() => StringFilterObjectSchema), z.string()])
      .optional(),
    isEnabled: z
      .union([z.lazy(() => BoolFilterObjectSchema), z.boolean()])
      .optional(),
    method: z
      .union([z.lazy(() => EnumFlowMethodFilterObjectSchema), FlowMethodSchema])
      .optional(),
    name: z
      .union([z.lazy(() => StringFilterObjectSchema), z.string()])
      .optional(),
    metadata: z.lazy(() => JsonNullableFilterObjectSchema).optional(),
    updatedAt: z
      .union([z.lazy(() => DateTimeFilterObjectSchema), z.coerce.date()])
      .optional(),
    viewport: z.lazy(() => JsonNullableFilterObjectSchema).optional(),
    deleted: z
      .union([z.lazy(() => BoolFilterObjectSchema), z.boolean()])
      .optional(),
    edges: z.lazy(() => EdgeListRelationFilterObjectSchema).optional(),
    flowRuns: z.lazy(() => FlowRunListRelationFilterObjectSchema).optional(),
    flowEvents: z
      .lazy(() => FlowEventListRelationFilterObjectSchema)
      .optional(),
    instance: z
      .union([
        z.lazy(() => InstanceScalarRelationFilterObjectSchema),
        z.lazy(() => InstanceWhereInputObjectSchema),
      ])
      .optional(),
    nodes: z.lazy(() => NodeListRelationFilterObjectSchema).optional(),
    secrets: z.lazy(() => SecretListRelationFilterObjectSchema).optional(),
    tags: z.lazy(() => TagListRelationFilterObjectSchema).optional(),
    testCases: z.lazy(() => TestCaseListRelationFilterObjectSchema).optional(),
    auditLogs: z.lazy(() => AuditLogListRelationFilterObjectSchema).optional(),
    statistics: z
      .union([
        z.lazy(() => FlowStatisticsNullableScalarRelationFilterObjectSchema),
        z.lazy(() => FlowStatisticsWhereInputObjectSchema),
      ])
      .optional()
      .nullable(),
  })
  .strict();

export const FlowWhereInputObjectSchema = Schema;
