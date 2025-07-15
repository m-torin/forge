import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    flows: z.boolean().optional(),
    tags: z.boolean().optional(),
    tagGroups: z.boolean().optional(),
  })
  .strict();

export const InstanceCountOutputTypeSelectObjectSchema = Schema;
