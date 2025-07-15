import { z } from 'zod';
import { MantineColorSchema } from '../enums/MantineColor.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    set: MantineColorSchema.optional(),
  })
  .strict();

export const EnumMantineColorFieldUpdateOperationsInputObjectSchema = Schema;
