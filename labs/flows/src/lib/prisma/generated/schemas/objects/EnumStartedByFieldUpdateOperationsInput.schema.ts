import { z } from 'zod';
import { StartedBySchema } from '../enums/StartedBy.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    set: StartedBySchema.optional(),
  })
  .strict();

export const EnumStartedByFieldUpdateOperationsInputObjectSchema = Schema;
