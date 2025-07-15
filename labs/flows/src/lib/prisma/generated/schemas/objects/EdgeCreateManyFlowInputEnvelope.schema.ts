import { z } from 'zod';
import { EdgeCreateManyFlowInputObjectSchema } from './EdgeCreateManyFlowInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    data: z.union([
      z.lazy(() => EdgeCreateManyFlowInputObjectSchema),
      z.lazy(() => EdgeCreateManyFlowInputObjectSchema).array(),
    ]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export const EdgeCreateManyFlowInputEnvelopeObjectSchema = Schema;
