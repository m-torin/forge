import { z } from 'zod';
import { TestCaseCreateManyFlowInputObjectSchema } from './TestCaseCreateManyFlowInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    data: z.union([
      z.lazy(() => TestCaseCreateManyFlowInputObjectSchema),
      z.lazy(() => TestCaseCreateManyFlowInputObjectSchema).array(),
    ]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export const TestCaseCreateManyFlowInputEnvelopeObjectSchema = Schema;
