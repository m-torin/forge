import { z } from 'zod';
import { FlowArgsObjectSchema } from './FlowArgs.schema';
import { NodeArgsObjectSchema } from './NodeArgs.schema';
import { TagGroupArgsObjectSchema } from './TagGroupArgs.schema';
import { InstanceArgsObjectSchema } from './InstanceArgs.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    flow: z.union([z.boolean(), z.lazy(() => FlowArgsObjectSchema)]).optional(),
    node: z.union([z.boolean(), z.lazy(() => NodeArgsObjectSchema)]).optional(),
    tagGroup: z
      .union([z.boolean(), z.lazy(() => TagGroupArgsObjectSchema)])
      .optional(),
    instance: z
      .union([z.boolean(), z.lazy(() => InstanceArgsObjectSchema)])
      .optional(),
  })
  .strict();

export const TagIncludeObjectSchema = Schema;
