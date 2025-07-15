import { z } from 'zod';
import { StartedBySchema } from '../enums/StartedBy.schema';
import { NestedEnumStartedByFilterObjectSchema } from './NestedEnumStartedByFilter.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    equals: StartedBySchema.optional(),
    in: StartedBySchema.array().optional(),
    notIn: StartedBySchema.array().optional(),
    not: z
      .union([
        StartedBySchema,
        z.lazy(() => NestedEnumStartedByFilterObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const EnumStartedByFilterObjectSchema = Schema;
