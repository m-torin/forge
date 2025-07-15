import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    edges: z.boolean().optional(),
    flowRuns: z.boolean().optional(),
    flowEvents: z.boolean().optional(),
    nodes: z.boolean().optional(),
    secrets: z.boolean().optional(),
    tags: z.boolean().optional(),
    testCases: z.boolean().optional(),
    auditLogs: z.boolean().optional(),
  })
  .strict();

export const FlowCountOutputTypeSelectObjectSchema = Schema;
