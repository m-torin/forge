import { z } from 'zod';
import { FlowArgsObjectSchema } from './FlowArgs.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    color: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    flow: z.union([z.boolean(), z.lazy(() => FlowArgsObjectSchema)]).optional(),
    flowId: z.boolean().optional(),
    id: z.boolean().optional(),
    name: z.boolean().optional(),
    metadata: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    deleted: z.boolean().optional(),
  })
  .strict();

export const TestCaseSelectObjectSchema = Schema;
