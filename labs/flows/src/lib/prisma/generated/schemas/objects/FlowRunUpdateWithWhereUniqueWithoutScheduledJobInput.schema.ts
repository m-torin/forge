import { z } from 'zod';
import { FlowRunWhereUniqueInputObjectSchema } from './FlowRunWhereUniqueInput.schema';
import { FlowRunUpdateWithoutScheduledJobInputObjectSchema } from './FlowRunUpdateWithoutScheduledJobInput.schema';
import { FlowRunUncheckedUpdateWithoutScheduledJobInputObjectSchema } from './FlowRunUncheckedUpdateWithoutScheduledJobInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => FlowRunWhereUniqueInputObjectSchema),
    data: z.union([
      z.lazy(() => FlowRunUpdateWithoutScheduledJobInputObjectSchema),
      z.lazy(() => FlowRunUncheckedUpdateWithoutScheduledJobInputObjectSchema),
    ]),
  })
  .strict();

export const FlowRunUpdateWithWhereUniqueWithoutScheduledJobInputObjectSchema =
  Schema;
