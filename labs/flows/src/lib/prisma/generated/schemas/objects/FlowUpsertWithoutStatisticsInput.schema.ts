import { z } from 'zod';
import { FlowUpdateWithoutStatisticsInputObjectSchema } from './FlowUpdateWithoutStatisticsInput.schema';
import { FlowUncheckedUpdateWithoutStatisticsInputObjectSchema } from './FlowUncheckedUpdateWithoutStatisticsInput.schema';
import { FlowCreateWithoutStatisticsInputObjectSchema } from './FlowCreateWithoutStatisticsInput.schema';
import { FlowUncheckedCreateWithoutStatisticsInputObjectSchema } from './FlowUncheckedCreateWithoutStatisticsInput.schema';
import { FlowWhereInputObjectSchema } from './FlowWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    update: z.union([
      z.lazy(() => FlowUpdateWithoutStatisticsInputObjectSchema),
      z.lazy(() => FlowUncheckedUpdateWithoutStatisticsInputObjectSchema),
    ]),
    create: z.union([
      z.lazy(() => FlowCreateWithoutStatisticsInputObjectSchema),
      z.lazy(() => FlowUncheckedCreateWithoutStatisticsInputObjectSchema),
    ]),
    where: z.lazy(() => FlowWhereInputObjectSchema).optional(),
  })
  .strict();

export const FlowUpsertWithoutStatisticsInputObjectSchema = Schema;
