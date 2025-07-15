import { z } from 'zod';
import { FlowMethodSchema } from '../enums/FlowMethod.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    set: FlowMethodSchema.optional(),
  })
  .strict();

export const EnumFlowMethodFieldUpdateOperationsInputObjectSchema = Schema;
