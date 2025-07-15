import { z } from 'zod';
import { FlowArgsObjectSchema } from './FlowArgs.schema';
import { NodeArgsObjectSchema } from './NodeArgs.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    flow: z.union([z.boolean(), z.lazy(() => FlowArgsObjectSchema)]).optional(),
    node: z.union([z.boolean(), z.lazy(() => NodeArgsObjectSchema)]).optional(),
  })
  .strict();

export const SecretIncludeObjectSchema = Schema;
