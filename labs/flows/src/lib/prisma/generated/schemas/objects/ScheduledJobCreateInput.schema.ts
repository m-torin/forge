import { z } from 'zod';
import { FlowRunCreateNestedManyWithoutScheduledJobInputObjectSchema } from './FlowRunCreateNestedManyWithoutScheduledJobInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    createdAt: z.coerce.date().optional(),
    createdBy: z.string(),
    endpoint: z.string(),
    frequency: z.string(),
    name: z.string(),
    deleted: z.boolean().optional(),
    flowRuns: z
      .lazy(() => FlowRunCreateNestedManyWithoutScheduledJobInputObjectSchema)
      .optional(),
  })
  .strict();

export const ScheduledJobCreateInputObjectSchema = Schema;
