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
    edges: z.union([z.boolean(), z.lazy(() => EdgeFindManySchema)]).optional(),
    flowRuns: z
      .union([z.boolean(), z.lazy(() => FlowRunFindManySchema)])
      .optional(),
    flowEvents: z
      .union([z.boolean(), z.lazy(() => FlowEventFindManySchema)])
      .optional(),
    instance: z
      .union([z.boolean(), z.lazy(() => InstanceArgsObjectSchema)])
      .optional(),
    nodes: z.union([z.boolean(), z.lazy(() => NodeFindManySchema)]).optional(),
    secrets: z
      .union([z.boolean(), z.lazy(() => SecretFindManySchema)])
      .optional(),
    tags: z.union([z.boolean(), z.lazy(() => TagFindManySchema)]).optional(),
    testCases: z
      .union([z.boolean(), z.lazy(() => TestCaseFindManySchema)])
      .optional(),
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

export const FlowIncludeObjectSchema = Schema;
