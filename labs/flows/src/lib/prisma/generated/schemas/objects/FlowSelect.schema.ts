import { z } from 'zod';
import { EdgeFindManySchema } from '../findManyEdge.schema';
import { FlowRunFindManySchema } from '../findManyFlowRun.schema';
import { FlowEventFindManySchema } from '../findManyFlowEvent.schema';
import { InstanceArgsObjectSchema } from './InstanceArgs.schema';
import { NodeFindManySchema } from '../findManyNode.schema';
import { SecretFindManySchema } from '../findManySecret.schema';
import { TagFindManySchema } from '../findManyTag.schema';
import { TestCaseFindManySchema } from '../findManyTestCase.schema';
import { AuditLogFindManySchema } from '../findManyAuditLog.schema';
import { FlowStatisticsArgsObjectSchema } from './FlowStatisticsArgs.schema';
import { FlowCountOutputTypeArgsObjectSchema } from './FlowCountOutputTypeArgs.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    createdAt: z.boolean().optional(),
    edges: z.union([z.boolean(), z.lazy(() => EdgeFindManySchema)]).optional(),
    flowRuns: z
      .union([z.boolean(), z.lazy(() => FlowRunFindManySchema)])
      .optional(),
    flowEvents: z
      .union([z.boolean(), z.lazy(() => FlowEventFindManySchema)])
      .optional(),
    id: z.boolean().optional(),
    instance: z
      .union([z.boolean(), z.lazy(() => InstanceArgsObjectSchema)])
      .optional(),
    instanceId: z.boolean().optional(),
    isEnabled: z.boolean().optional(),
    method: z.boolean().optional(),
    name: z.boolean().optional(),
    metadata: z.boolean().optional(),
    nodes: z.union([z.boolean(), z.lazy(() => NodeFindManySchema)]).optional(),
    secrets: z
      .union([z.boolean(), z.lazy(() => SecretFindManySchema)])
      .optional(),
    tags: z.union([z.boolean(), z.lazy(() => TagFindManySchema)]).optional(),
    testCases: z
      .union([z.boolean(), z.lazy(() => TestCaseFindManySchema)])
      .optional(),
    updatedAt: z.boolean().optional(),
    viewport: z.boolean().optional(),
    deleted: z.boolean().optional(),
    auditLogs: z
      .union([z.boolean(), z.lazy(() => AuditLogFindManySchema)])
      .optional(),
    statistics: z
      .union([z.boolean(), z.lazy(() => FlowStatisticsArgsObjectSchema)])
      .optional(),
    _count: z
      .union([z.boolean(), z.lazy(() => FlowCountOutputTypeArgsObjectSchema)])
      .optional(),
  })
  .strict();

export const FlowSelectObjectSchema = Schema;
