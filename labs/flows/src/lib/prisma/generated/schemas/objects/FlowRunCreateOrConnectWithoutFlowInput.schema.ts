import { z } from 'zod';
import { FlowRunWhereUniqueInputObjectSchema } from './FlowRunWhereUniqueInput.schema';
import { FlowRunCreateWithoutFlowInputObjectSchema } from './FlowRunCreateWithoutFlowInput.schema';
import { FlowRunUncheckedCreateWithoutFlowInputObjectSchema } from './FlowRunUncheckedCreateWithoutFlowInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    where: z.lazy(() => FlowRunWhereUniqueInputObjectSchema),
    create: z.union([
      z.lazy(() => FlowRunCreateWithoutFlowInputObjectSchema),
      z.lazy(() => FlowRunUncheckedCreateWithoutFlowInputObjectSchema),
    ]),
  })
  .strict();

export const FlowRunCreateOrConnectWithoutFlowInputObjectSchema = Schema;
