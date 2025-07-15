import { z } from 'zod';
import { FlowRunUncheckedCreateNestedManyWithoutScheduledJobInputObjectSchema } from './FlowRunUncheckedCreateNestedManyWithoutScheduledJobInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    createdAt: z.coerce.date().optional(),
    createdBy: z.string(),
    endpoint: z.string(),
    frequency: z.string(),
    id: z.number().int().optional(),
    name: z.string(),
    deleted: z.boolean().optional(),
    flowRuns: z
      .lazy(
        () =>
          FlowRunUncheckedCreateNestedManyWithoutScheduledJobInputObjectSchema,
      )
      .optional(),
  })
  .strict();

export const ScheduledJobUncheckedCreateInputObjectSchema = Schema;
