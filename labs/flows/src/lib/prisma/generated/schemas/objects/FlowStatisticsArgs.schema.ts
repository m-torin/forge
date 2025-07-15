import { z } from 'zod';
import { FlowStatisticsSelectObjectSchema } from './FlowStatisticsSelect.schema';
import { FlowStatisticsIncludeObjectSchema } from './FlowStatisticsInclude.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    select: z.lazy(() => FlowStatisticsSelectObjectSchema).optional(),
    include: z.lazy(() => FlowStatisticsIncludeObjectSchema).optional(),
  })
  .strict();

export const FlowStatisticsArgsObjectSchema = Schema;
