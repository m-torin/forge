import { z } from 'zod';
import { FlowRunCreateManyFlowInputObjectSchema } from './FlowRunCreateManyFlowInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    data: z.union([
      z.lazy(() => FlowRunCreateManyFlowInputObjectSchema),
      z.lazy(() => FlowRunCreateManyFlowInputObjectSchema).array(),
    ]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export const FlowRunCreateManyFlowInputEnvelopeObjectSchema = Schema;
