import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    flowId: z.string(),
    rfId: z.string(),
  })
  .strict();

export const NodeFlowIdRfIdCompoundUniqueInputObjectSchema = Schema;
