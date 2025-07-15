import { z } from 'zod';
import { ScheduledJobWhereInputObjectSchema } from './ScheduledJobWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    is: z
      .lazy(() => ScheduledJobWhereInputObjectSchema)
      .optional()
      .nullable(),
    isNot: z
      .lazy(() => ScheduledJobWhereInputObjectSchema)
      .optional()
      .nullable(),
  })
  .strict();

export const ScheduledJobNullableScalarRelationFilterObjectSchema = Schema;
