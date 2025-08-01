import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    nodes: z.boolean().optional(),
  })
  .strict();

export const InfrastructureCountOutputTypeSelectObjectSchema = Schema;
