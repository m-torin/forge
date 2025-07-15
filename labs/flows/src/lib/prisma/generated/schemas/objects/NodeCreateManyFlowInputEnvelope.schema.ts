import { z } from 'zod';
import { NodeCreateManyFlowInputObjectSchema } from './NodeCreateManyFlowInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    data: z.union([
      z.lazy(() => NodeCreateManyFlowInputObjectSchema),
      z.lazy(() => NodeCreateManyFlowInputObjectSchema).array(),
    ]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export const NodeCreateManyFlowInputEnvelopeObjectSchema = Schema;
