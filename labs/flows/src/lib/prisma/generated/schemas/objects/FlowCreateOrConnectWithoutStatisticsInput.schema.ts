import { z } from 'zod';
import { FlowWhereUniqueInputObjectSchema } from './FlowWhereUniqueInput.schema';
import { FlowCreateWithoutStatisticsInputObjectSchema } from './FlowCreateWithoutStatisticsInput.schema';
import { FlowUncheckedCreateWithoutStatisticsInputObjectSchema } from './FlowUncheckedCreateWithoutStatisticsInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => FlowWhereUniqueInputObjectSchema),
    create: z.union([
      z.lazy(() => FlowCreateWithoutStatisticsInputObjectSchema),
      z.lazy(() => FlowUncheckedCreateWithoutStatisticsInputObjectSchema),
    ]),
  })
  .strict();

export const FlowCreateOrConnectWithoutStatisticsInputObjectSchema = Schema;
