import { z } from 'zod';
import { NodeTypeSchema } from '../enums/NodeType.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    set: NodeTypeSchema.optional(),
  })
  .strict();

export const EnumNodeTypeFieldUpdateOperationsInputObjectSchema = Schema;
