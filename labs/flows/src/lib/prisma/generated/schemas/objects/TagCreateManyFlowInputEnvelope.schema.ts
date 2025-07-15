import { z } from 'zod';
import { TagCreateManyFlowInputObjectSchema } from './TagCreateManyFlowInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    data: z.union([
      z.lazy(() => TagCreateManyFlowInputObjectSchema),
      z.lazy(() => TagCreateManyFlowInputObjectSchema).array(),
    ]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export const TagCreateManyFlowInputEnvelopeObjectSchema = Schema;
