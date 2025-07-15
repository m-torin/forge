import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    set: z.boolean().optional().nullable(),
  })
  .strict();

export const NullableBoolFieldUpdateOperationsInputObjectSchema = Schema;
