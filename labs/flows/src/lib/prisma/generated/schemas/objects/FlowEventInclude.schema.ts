import { z } from 'zod';
import { FlowRunArgsObjectSchema } from './FlowRunArgs.schema';
import { FlowArgsObjectSchema } from './FlowArgs.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    flowRun: z
      .union([z.boolean(), z.lazy(() => FlowRunArgsObjectSchema)])
      .optional(),
    flow: z.union([z.boolean(), z.lazy(() => FlowArgsObjectSchema)]).optional(),
  })
  .strict();

export const FlowEventIncludeObjectSchema = Schema;
