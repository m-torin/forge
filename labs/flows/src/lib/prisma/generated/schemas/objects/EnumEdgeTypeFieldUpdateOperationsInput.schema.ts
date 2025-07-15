import { z } from 'zod';
import { EdgeTypeSchema } from '../enums/EdgeType.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    set: EdgeTypeSchema.optional(),
  })
  .strict();

export const EnumEdgeTypeFieldUpdateOperationsInputObjectSchema = Schema;
