import { z } from 'zod';
import { RunStatusSchema } from '../enums/RunStatus.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    set: RunStatusSchema.optional(),
  })
  .strict();

export const EnumRunStatusFieldUpdateOperationsInputObjectSchema = Schema;
