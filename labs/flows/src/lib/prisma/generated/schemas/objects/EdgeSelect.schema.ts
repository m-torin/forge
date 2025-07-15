import { z } from 'zod';
import { FlowArgsObjectSchema } from './FlowArgs.schema';
import { NodeArgsObjectSchema } from './NodeArgs.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    id: z.boolean().optional(),
    sourceNodeId: z.boolean().optional(),
    targetNodeId: z.boolean().optional(),
    flowId: z.boolean().optional(),
    rfId: z.boolean().optional(),
    label: z.boolean().optional(),
    isActive: z.boolean().optional(),
    type: z.boolean().optional(),
    normalizedKey: z.boolean().optional(),
    metadata: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    deleted: z.boolean().optional(),
    flow: z.union([z.boolean(), z.lazy(() => FlowArgsObjectSchema)]).optional(),
    sourceNode: z
      .union([z.boolean(), z.lazy(() => NodeArgsObjectSchema)])
      .optional(),
    targetNode: z
      .union([z.boolean(), z.lazy(() => NodeArgsObjectSchema)])
      .optional(),
  })
  .strict();

export const EdgeSelectObjectSchema = Schema;
