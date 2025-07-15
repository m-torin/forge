import { z } from 'zod';
import { FlowStatisticsCreateWithoutFlowInputObjectSchema } from './FlowStatisticsCreateWithoutFlowInput.schema';
import { FlowStatisticsUncheckedCreateWithoutFlowInputObjectSchema } from './FlowStatisticsUncheckedCreateWithoutFlowInput.schema';
import { FlowStatisticsCreateOrConnectWithoutFlowInputObjectSchema } from './FlowStatisticsCreateOrConnectWithoutFlowInput.schema';
import { FlowStatisticsWhereUniqueInputObjectSchema } from './FlowStatisticsWhereUniqueInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => FlowStatisticsCreateWithoutFlowInputObjectSchema),
        z.lazy(() => FlowStatisticsUncheckedCreateWithoutFlowInputObjectSchema),
      ])
      .optional(),
    connectOrCreate: z
      .lazy(() => FlowStatisticsCreateOrConnectWithoutFlowInputObjectSchema)
      .optional(),
    connect: z
      .lazy(() => FlowStatisticsWhereUniqueInputObjectSchema)
      .optional(),
  })
  .strict();

export const FlowStatisticsCreateNestedOneWithoutFlowInputObjectSchema = Schema;
