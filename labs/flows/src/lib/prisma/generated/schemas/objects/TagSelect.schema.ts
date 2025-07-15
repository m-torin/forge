import { z } from 'zod';
import { FlowArgsObjectSchema } from './FlowArgs.schema';
import { NodeArgsObjectSchema } from './NodeArgs.schema';
import { TagGroupArgsObjectSchema } from './TagGroupArgs.schema';
import { InstanceArgsObjectSchema } from './InstanceArgs.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    id: z.boolean().optional(),
    name: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    deleted: z.boolean().optional(),
    metadata: z.boolean().optional(),
    flow: z.union([z.boolean(), z.lazy(() => FlowArgsObjectSchema)]).optional(),
    flowId: z.boolean().optional(),
    node: z.union([z.boolean(), z.lazy(() => NodeArgsObjectSchema)]).optional(),
    nodeId: z.boolean().optional(),
    tagGroup: z
      .union([z.boolean(), z.lazy(() => TagGroupArgsObjectSchema)])
      .optional(),
    tagGroupId: z.boolean().optional(),
    instance: z
      .union([z.boolean(), z.lazy(() => InstanceArgsObjectSchema)])
      .optional(),
    instanceId: z.boolean().optional(),
  })
  .strict();

export const TagSelectObjectSchema = Schema;
