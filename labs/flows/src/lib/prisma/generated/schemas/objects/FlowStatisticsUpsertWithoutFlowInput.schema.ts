import { z } from 'zod';
import { FlowStatisticsUpdateWithoutFlowInputObjectSchema } from './FlowStatisticsUpdateWithoutFlowInput.schema';
import { FlowStatisticsUncheckedUpdateWithoutFlowInputObjectSchema } from './FlowStatisticsUncheckedUpdateWithoutFlowInput.schema';
import { FlowStatisticsCreateWithoutFlowInputObjectSchema } from './FlowStatisticsCreateWithoutFlowInput.schema';
import { FlowStatisticsUncheckedCreateWithoutFlowInputObjectSchema } from './FlowStatisticsUncheckedCreateWithoutFlowInput.schema';
import { FlowStatisticsWhereInputObjectSchema } from './FlowStatisticsWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    update: z.union([
      z.lazy(() => FlowStatisticsUpdateWithoutFlowInputObjectSchema),
      z.lazy(() => FlowStatisticsUncheckedUpdateWithoutFlowInputObjectSchema),
    ]),
    create: z.union([
      z.lazy(() => FlowStatisticsCreateWithoutFlowInputObjectSchema),
      z.lazy(() => FlowStatisticsUncheckedCreateWithoutFlowInputObjectSchema),
    ]),
    where: z.lazy(() => FlowStatisticsWhereInputObjectSchema).optional(),
  })
  .strict();

export const FlowStatisticsUpsertWithoutFlowInputObjectSchema = Schema;
