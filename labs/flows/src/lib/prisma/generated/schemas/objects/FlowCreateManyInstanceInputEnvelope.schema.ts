import { z } from 'zod';
import { FlowCreateManyInstanceInputObjectSchema } from './FlowCreateManyInstanceInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    data: z.union([
      z.lazy(() => FlowCreateManyInstanceInputObjectSchema),
      z.lazy(() => FlowCreateManyInstanceInputObjectSchema).array(),
    ]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export const FlowCreateManyInstanceInputEnvelopeObjectSchema = Schema;
