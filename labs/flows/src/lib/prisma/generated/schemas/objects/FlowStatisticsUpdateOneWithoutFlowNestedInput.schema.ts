import { z } from 'zod';
import { FlowStatisticsCreateWithoutFlowInputObjectSchema } from './FlowStatisticsCreateWithoutFlowInput.schema';
import { FlowStatisticsUncheckedCreateWithoutFlowInputObjectSchema } from './FlowStatisticsUncheckedCreateWithoutFlowInput.schema';
import { FlowStatisticsCreateOrConnectWithoutFlowInputObjectSchema } from './FlowStatisticsCreateOrConnectWithoutFlowInput.schema';
import { FlowStatisticsUpsertWithoutFlowInputObjectSchema } from './FlowStatisticsUpsertWithoutFlowInput.schema';
import { FlowStatisticsWhereInputObjectSchema } from './FlowStatisticsWhereInput.schema';
import { FlowStatisticsWhereUniqueInputObjectSchema } from './FlowStatisticsWhereUniqueInput.schema';
import { FlowStatisticsUpdateToOneWithWhereWithoutFlowInputObjectSchema } from './FlowStatisticsUpdateToOneWithWhereWithoutFlowInput.schema';
import { FlowStatisticsUpdateWithoutFlowInputObjectSchema } from './FlowStatisticsUpdateWithoutFlowInput.schema';
import { FlowStatisticsUncheckedUpdateWithoutFlowInputObjectSchema } from './FlowStatisticsUncheckedUpdateWithoutFlowInput.schema';

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
    upsert: z
      .lazy(() => FlowStatisticsUpsertWithoutFlowInputObjectSchema)
      .optional(),
    disconnect: z
      .union([z.boolean(), z.lazy(() => FlowStatisticsWhereInputObjectSchema)])
      .optional(),
    delete: z
      .union([z.boolean(), z.lazy(() => FlowStatisticsWhereInputObjectSchema)])
      .optional(),
    connect: z
      .lazy(() => FlowStatisticsWhereUniqueInputObjectSchema)
      .optional(),
    update: z
      .union([
        z.lazy(
          () => FlowStatisticsUpdateToOneWithWhereWithoutFlowInputObjectSchema,
        ),
        z.lazy(() => FlowStatisticsUpdateWithoutFlowInputObjectSchema),
        z.lazy(() => FlowStatisticsUncheckedUpdateWithoutFlowInputObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const FlowStatisticsUpdateOneWithoutFlowNestedInputObjectSchema = Schema;
