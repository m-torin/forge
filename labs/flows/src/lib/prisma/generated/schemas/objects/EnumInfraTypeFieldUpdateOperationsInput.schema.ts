import { z } from 'zod';
import { InfraTypeSchema } from '../enums/InfraType.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    set: InfraTypeSchema.optional(),
  })
  .strict();

export const EnumInfraTypeFieldUpdateOperationsInputObjectSchema = Schema;
