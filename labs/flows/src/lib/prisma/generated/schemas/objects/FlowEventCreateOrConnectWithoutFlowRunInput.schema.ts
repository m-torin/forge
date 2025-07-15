import { z } from 'zod';
import { FlowEventWhereUniqueInputObjectSchema } from './FlowEventWhereUniqueInput.schema';
import { FlowEventCreateWithoutFlowRunInputObjectSchema } from './FlowEventCreateWithoutFlowRunInput.schema';
import { FlowEventUncheckedCreateWithoutFlowRunInputObjectSchema } from './FlowEventUncheckedCreateWithoutFlowRunInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => FlowEventWhereUniqueInputObjectSchema),
    create: z.union([
      z.lazy(() => FlowEventCreateWithoutFlowRunInputObjectSchema),
      z.lazy(() => FlowEventUncheckedCreateWithoutFlowRunInputObjectSchema),
    ]),
  })
  .strict();

export const FlowEventCreateOrConnectWithoutFlowRunInputObjectSchema = Schema;
