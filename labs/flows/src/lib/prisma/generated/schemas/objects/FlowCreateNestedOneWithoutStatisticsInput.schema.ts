import { z } from 'zod';
import { FlowCreateWithoutStatisticsInputObjectSchema } from './FlowCreateWithoutStatisticsInput.schema';
import { FlowUncheckedCreateWithoutStatisticsInputObjectSchema } from './FlowUncheckedCreateWithoutStatisticsInput.schema';
import { FlowCreateOrConnectWithoutStatisticsInputObjectSchema } from './FlowCreateOrConnectWithoutStatisticsInput.schema';
import { FlowWhereUniqueInputObjectSchema } from './FlowWhereUniqueInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    create: z
      .union([
        z.lazy(() => FlowCreateWithoutStatisticsInputObjectSchema),
        z.lazy(() => FlowUncheckedCreateWithoutStatisticsInputObjectSchema),
      ])
      .optional(),
    connectOrCreate: z
      .lazy(() => FlowCreateOrConnectWithoutStatisticsInputObjectSchema)
      .optional(),
    connect: z.lazy(() => FlowWhereUniqueInputObjectSchema).optional(),
  })
  .strict();

export const FlowCreateNestedOneWithoutStatisticsInputObjectSchema = Schema;
