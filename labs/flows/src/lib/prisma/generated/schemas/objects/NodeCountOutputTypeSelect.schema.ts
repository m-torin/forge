import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    secrets: z.boolean().optional(),
    sourceEdges: z.boolean().optional(),
    targetEdges: z.boolean().optional(),
    Tag: z.boolean().optional(),
  })
  .strict();

export const NodeCountOutputTypeSelectObjectSchema = Schema;
