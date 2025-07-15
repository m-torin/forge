import { z } from 'zod';
import { FlowRunArgsObjectSchema } from './FlowRunArgs.schema';
import { FlowArgsObjectSchema } from './FlowArgs.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    createdAt: z.boolean().optional(),
    flowRun: z
      .union([z.boolean(), z.lazy(() => FlowRunArgsObjectSchema)])
      .optional(),
    flowRunId: z.boolean().optional(),
    flow: z.union([z.boolean(), z.lazy(() => FlowArgsObjectSchema)]).optional(),
    flowId: z.boolean().optional(),
    id: z.boolean().optional(),
    nodeId: z.boolean().optional(),
    payload: z.boolean().optional(),
    metadata: z.boolean().optional(),
    startedBy: z.boolean().optional(),
  })
  .strict();

export const FlowEventSelectObjectSchema = Schema;
