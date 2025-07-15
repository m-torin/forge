import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    sourceNodeId: z.string(),
    targetNodeId: z.string(),
  })
  .strict();

export const EdgeSourceNodeIdTargetNodeIdCompoundUniqueInputObjectSchema =
  Schema;
