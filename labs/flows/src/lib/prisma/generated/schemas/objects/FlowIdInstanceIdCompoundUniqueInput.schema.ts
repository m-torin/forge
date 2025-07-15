import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    id: z.string(),
    instanceId: z.string(),
  })
  .strict();

export const FlowIdInstanceIdCompoundUniqueInputObjectSchema = Schema;
