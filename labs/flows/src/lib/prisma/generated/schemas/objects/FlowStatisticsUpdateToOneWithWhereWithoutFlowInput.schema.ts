import { z } from 'zod';
import { FlowStatisticsWhereInputObjectSchema } from './FlowStatisticsWhereInput.schema';
import { FlowStatisticsUpdateWithoutFlowInputObjectSchema } from './FlowStatisticsUpdateWithoutFlowInput.schema';
import { FlowStatisticsUncheckedUpdateWithoutFlowInputObjectSchema } from './FlowStatisticsUncheckedUpdateWithoutFlowInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => FlowStatisticsWhereInputObjectSchema).optional(),
    data: z.union([
      z.lazy(() => FlowStatisticsUpdateWithoutFlowInputObjectSchema),
      z.lazy(() => FlowStatisticsUncheckedUpdateWithoutFlowInputObjectSchema),
    ]),
  })
  .strict();

export const FlowStatisticsUpdateToOneWithWhereWithoutFlowInputObjectSchema =
  Schema;
