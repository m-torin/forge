import { z } from 'zod';
import { FlowWhereInputObjectSchema } from './FlowWhereInput.schema';
import { FlowUpdateWithoutStatisticsInputObjectSchema } from './FlowUpdateWithoutStatisticsInput.schema';
import { FlowUncheckedUpdateWithoutStatisticsInputObjectSchema } from './FlowUncheckedUpdateWithoutStatisticsInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => FlowWhereInputObjectSchema).optional(),
    data: z.union([
      z.lazy(() => FlowUpdateWithoutStatisticsInputObjectSchema),
      z.lazy(() => FlowUncheckedUpdateWithoutStatisticsInputObjectSchema),
    ]),
  })
  .strict();

export const FlowUpdateToOneWithWhereWithoutStatisticsInputObjectSchema =
  Schema;
