import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';
import { SortOrderInputObjectSchema } from './SortOrderInput.schema';
import { EdgeOrderByRelationAggregateInputObjectSchema } from './EdgeOrderByRelationAggregateInput.schema';
import { FlowRunOrderByRelationAggregateInputObjectSchema } from './FlowRunOrderByRelationAggregateInput.schema';
import { FlowEventOrderByRelationAggregateInputObjectSchema } from './FlowEventOrderByRelationAggregateInput.schema';
import { InstanceOrderByWithRelationInputObjectSchema } from './InstanceOrderByWithRelationInput.schema';
import { NodeOrderByRelationAggregateInputObjectSchema } from './NodeOrderByRelationAggregateInput.schema';
import { SecretOrderByRelationAggregateInputObjectSchema } from './SecretOrderByRelationAggregateInput.schema';
import { TagOrderByRelationAggregateInputObjectSchema } from './TagOrderByRelationAggregateInput.schema';
import { TestCaseOrderByRelationAggregateInputObjectSchema } from './TestCaseOrderByRelationAggregateInput.schema';
import { AuditLogOrderByRelationAggregateInputObjectSchema } from './AuditLogOrderByRelationAggregateInput.schema';
import { FlowStatisticsOrderByWithRelationInputObjectSchema } from './FlowStatisticsOrderByWithRelationInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.FlowOrderByWithRelationInput> = z
  .object({
    createdAt: SortOrderSchema.optional(),
    id: SortOrderSchema.optional(),
    instanceId: SortOrderSchema.optional(),
    isEnabled: SortOrderSchema.optional(),
    method: SortOrderSchema.optional(),
    name: SortOrderSchema.optional(),
    metadata: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    updatedAt: SortOrderSchema.optional(),
    viewport: z
      .union([SortOrderSchema, z.lazy(() => SortOrderInputObjectSchema)])
      .optional(),
    deleted: SortOrderSchema.optional(),
    edges: z
      .lazy(() => EdgeOrderByRelationAggregateInputObjectSchema)
      .optional(),
    flowRuns: z
      .lazy(() => FlowRunOrderByRelationAggregateInputObjectSchema)
      .optional(),
    flowEvents: z
      .lazy(() => FlowEventOrderByRelationAggregateInputObjectSchema)
      .optional(),
    instance: z
      .lazy(() => InstanceOrderByWithRelationInputObjectSchema)
      .optional(),
    nodes: z
      .lazy(() => NodeOrderByRelationAggregateInputObjectSchema)
      .optional(),
    secrets: z
      .lazy(() => SecretOrderByRelationAggregateInputObjectSchema)
      .optional(),
    tags: z.lazy(() => TagOrderByRelationAggregateInputObjectSchema).optional(),
    testCases: z
      .lazy(() => TestCaseOrderByRelationAggregateInputObjectSchema)
      .optional(),
    auditLogs: z
      .lazy(() => AuditLogOrderByRelationAggregateInputObjectSchema)
      .optional(),
    statistics: z
      .lazy(() => FlowStatisticsOrderByWithRelationInputObjectSchema)
      .optional(),
  })
  .strict();

export const FlowOrderByWithRelationInputObjectSchema = Schema;
