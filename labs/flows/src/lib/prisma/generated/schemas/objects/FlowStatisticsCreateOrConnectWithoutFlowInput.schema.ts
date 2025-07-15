import { z } from 'zod';
import { FlowStatisticsWhereUniqueInputObjectSchema } from './FlowStatisticsWhereUniqueInput.schema';
import { FlowStatisticsCreateWithoutFlowInputObjectSchema } from './FlowStatisticsCreateWithoutFlowInput.schema';
import { FlowStatisticsUncheckedCreateWithoutFlowInputObjectSchema } from './FlowStatisticsUncheckedCreateWithoutFlowInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => FlowStatisticsWhereUniqueInputObjectSchema),
    create: z.union([
      z.lazy(() => FlowStatisticsCreateWithoutFlowInputObjectSchema),
      z.lazy(() => FlowStatisticsUncheckedCreateWithoutFlowInputObjectSchema),
    ]),
  })
  .strict();

export const FlowStatisticsCreateOrConnectWithoutFlowInputObjectSchema = Schema;
