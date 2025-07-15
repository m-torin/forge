import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    id: z.number().int(),
    instanceId: z.string(),
  })
  .strict();

export const TagIdInstanceIdCompoundUniqueInputObjectSchema = Schema;
