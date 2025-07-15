import { z } from 'zod';
import { FlowEventCreateManyFlowInputObjectSchema } from './FlowEventCreateManyFlowInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    data: z.union([
      z.lazy(() => FlowEventCreateManyFlowInputObjectSchema),
      z.lazy(() => FlowEventCreateManyFlowInputObjectSchema).array(),
    ]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export const FlowEventCreateManyFlowInputEnvelopeObjectSchema = Schema;
