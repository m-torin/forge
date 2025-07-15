import { z } from 'zod';
import { FlowCreateWithoutStatisticsInputObjectSchema } from './FlowCreateWithoutStatisticsInput.schema';
import { FlowUncheckedCreateWithoutStatisticsInputObjectSchema } from './FlowUncheckedCreateWithoutStatisticsInput.schema';
import { FlowCreateOrConnectWithoutStatisticsInputObjectSchema } from './FlowCreateOrConnectWithoutStatisticsInput.schema';
import { FlowUpsertWithoutStatisticsInputObjectSchema } from './FlowUpsertWithoutStatisticsInput.schema';
import { FlowWhereUniqueInputObjectSchema } from './FlowWhereUniqueInput.schema';
import { FlowUpdateToOneWithWhereWithoutStatisticsInputObjectSchema } from './FlowUpdateToOneWithWhereWithoutStatisticsInput.schema';
import { FlowUpdateWithoutStatisticsInputObjectSchema } from './FlowUpdateWithoutStatisticsInput.schema';
import { FlowUncheckedUpdateWithoutStatisticsInputObjectSchema } from './FlowUncheckedUpdateWithoutStatisticsInput.schema';

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
    upsert: z
      .lazy(() => FlowUpsertWithoutStatisticsInputObjectSchema)
      .optional(),
    connect: z.lazy(() => FlowWhereUniqueInputObjectSchema).optional(),
    update: z
      .union([
        z.lazy(
          () => FlowUpdateToOneWithWhereWithoutStatisticsInputObjectSchema,
        ),
        z.lazy(() => FlowUpdateWithoutStatisticsInputObjectSchema),
        z.lazy(() => FlowUncheckedUpdateWithoutStatisticsInputObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const FlowUpdateOneRequiredWithoutStatisticsNestedInputObjectSchema =
  Schema;
