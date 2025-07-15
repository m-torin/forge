import { z } from 'zod';
import { FlowStatisticsWhereInputObjectSchema } from './FlowStatisticsWhereInput.schema';
import { IntFilterObjectSchema } from './IntFilter.schema';
import { DateTimeFilterObjectSchema } from './DateTimeFilter.schema';
import { FlowScalarRelationFilterObjectSchema } from './FlowScalarRelationFilter.schema';
import { FlowWhereInputObjectSchema } from './FlowWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.FlowStatisticsWhereUniqueInput> = z
  .object({
    id: z.string(),
    flowId: z.string(),
    AND: z
      .union([
        z.lazy(() => FlowStatisticsWhereInputObjectSchema),
        z.lazy(() => FlowStatisticsWhereInputObjectSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => FlowStatisticsWhereInputObjectSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => FlowStatisticsWhereInputObjectSchema),
        z.lazy(() => FlowStatisticsWhereInputObjectSchema).array(),
      ])
      .optional(),
    totalRuns: z
      .union([z.lazy(() => IntFilterObjectSchema), z.number().int()])
      .optional(),
    successfulRuns: z
      .union([z.lazy(() => IntFilterObjectSchema), z.number().int()])
      .optional(),
    failedRuns: z
      .union([z.lazy(() => IntFilterObjectSchema), z.number().int()])
      .optional(),
    lastUpdated: z
      .union([z.lazy(() => DateTimeFilterObjectSchema), z.coerce.date()])
      .optional(),
    flow: z
      .union([
        z.lazy(() => FlowScalarRelationFilterObjectSchema),
        z.lazy(() => FlowWhereInputObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const FlowStatisticsWhereUniqueInputObjectSchema = Schema;
