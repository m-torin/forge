import { z } from 'zod';
import { FlowStatisticsWhereInputObjectSchema } from './FlowStatisticsWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    is: z
      .lazy(() => FlowStatisticsWhereInputObjectSchema)
      .optional()
      .nullable(),
    isNot: z
      .lazy(() => FlowStatisticsWhereInputObjectSchema)
      .optional()
      .nullable(),
  })
  .strict();

export const FlowStatisticsNullableScalarRelationFilterObjectSchema = Schema;
