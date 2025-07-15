import { z } from 'zod';
import { FlowWhereInputObjectSchema } from './FlowWhereInput.schema';
import { FlowUpdateWithoutFlowRunsInputObjectSchema } from './FlowUpdateWithoutFlowRunsInput.schema';
import { FlowUncheckedUpdateWithoutFlowRunsInputObjectSchema } from './FlowUncheckedUpdateWithoutFlowRunsInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => FlowWhereInputObjectSchema).optional(),
    data: z.union([
      z.lazy(() => FlowUpdateWithoutFlowRunsInputObjectSchema),
      z.lazy(() => FlowUncheckedUpdateWithoutFlowRunsInputObjectSchema),
    ]),
  })
  .strict();

export const FlowUpdateToOneWithWhereWithoutFlowRunsInputObjectSchema = Schema;
