import { z } from 'zod';
import { FlowRunWhereUniqueInputObjectSchema } from './FlowRunWhereUniqueInput.schema';
import { FlowRunUpdateWithoutScheduledJobInputObjectSchema } from './FlowRunUpdateWithoutScheduledJobInput.schema';
import { FlowRunUncheckedUpdateWithoutScheduledJobInputObjectSchema } from './FlowRunUncheckedUpdateWithoutScheduledJobInput.schema';
import { FlowRunCreateWithoutScheduledJobInputObjectSchema } from './FlowRunCreateWithoutScheduledJobInput.schema';
import { FlowRunUncheckedCreateWithoutScheduledJobInputObjectSchema } from './FlowRunUncheckedCreateWithoutScheduledJobInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => FlowRunWhereUniqueInputObjectSchema),
    update: z.union([
      z.lazy(() => FlowRunUpdateWithoutScheduledJobInputObjectSchema),
      z.lazy(() => FlowRunUncheckedUpdateWithoutScheduledJobInputObjectSchema),
    ]),
    create: z.union([
      z.lazy(() => FlowRunCreateWithoutScheduledJobInputObjectSchema),
      z.lazy(() => FlowRunUncheckedCreateWithoutScheduledJobInputObjectSchema),
    ]),
  })
  .strict();

export const FlowRunUpsertWithWhereUniqueWithoutScheduledJobInputObjectSchema =
  Schema;
