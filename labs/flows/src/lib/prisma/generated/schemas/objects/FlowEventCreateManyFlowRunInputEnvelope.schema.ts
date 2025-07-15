import { z } from 'zod';
import { FlowEventCreateManyFlowRunInputObjectSchema } from './FlowEventCreateManyFlowRunInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    data: z.union([
      z.lazy(() => FlowEventCreateManyFlowRunInputObjectSchema),
      z.lazy(() => FlowEventCreateManyFlowRunInputObjectSchema).array(),
    ]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export const FlowEventCreateManyFlowRunInputEnvelopeObjectSchema = Schema;
