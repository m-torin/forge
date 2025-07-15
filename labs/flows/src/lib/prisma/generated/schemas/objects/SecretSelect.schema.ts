import { z } from 'zod';
import { FlowArgsObjectSchema } from './FlowArgs.schema';
import { NodeArgsObjectSchema } from './NodeArgs.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    name: z.boolean().optional(),
    category: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    flow: z.union([z.boolean(), z.lazy(() => FlowArgsObjectSchema)]).optional(),
    flowId: z.boolean().optional(),
    id: z.boolean().optional(),
    node: z.union([z.boolean(), z.lazy(() => NodeArgsObjectSchema)]).optional(),
    nodeId: z.boolean().optional(),
    secret: z.boolean().optional(),
    shouldEncrypt: z.boolean().optional(),
    metadata: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    deleted: z.boolean().optional(),
  })
  .strict();

export const SecretSelectObjectSchema = Schema;
