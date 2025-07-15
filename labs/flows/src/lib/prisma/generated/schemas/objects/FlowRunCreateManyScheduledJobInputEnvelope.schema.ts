import { z } from 'zod';
import { FlowRunCreateManyScheduledJobInputObjectSchema } from './FlowRunCreateManyScheduledJobInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    data: z.union([
      z.lazy(() => FlowRunCreateManyScheduledJobInputObjectSchema),
      z.lazy(() => FlowRunCreateManyScheduledJobInputObjectSchema).array(),
    ]),
    skipDuplicates: z.boolean().optional(),
  })
  .strict();

export const FlowRunCreateManyScheduledJobInputEnvelopeObjectSchema = Schema;
