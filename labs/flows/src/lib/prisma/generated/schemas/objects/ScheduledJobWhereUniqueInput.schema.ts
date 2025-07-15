import { z } from 'zod';
import { ScheduledJobWhereInputObjectSchema } from './ScheduledJobWhereInput.schema';
import { DateTimeFilterObjectSchema } from './DateTimeFilter.schema';
import { StringFilterObjectSchema } from './StringFilter.schema';
import { BoolFilterObjectSchema } from './BoolFilter.schema';
import { FlowRunListRelationFilterObjectSchema } from './FlowRunListRelationFilter.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.ScheduledJobWhereUniqueInput> = z
  .object({
    id: z.number().int(),
    AND: z
      .union([
        z.lazy(() => ScheduledJobWhereInputObjectSchema),
        z.lazy(() => ScheduledJobWhereInputObjectSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => ScheduledJobWhereInputObjectSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => ScheduledJobWhereInputObjectSchema),
        z.lazy(() => ScheduledJobWhereInputObjectSchema).array(),
      ])
      .optional(),
    createdAt: z
      .union([z.lazy(() => DateTimeFilterObjectSchema), z.coerce.date()])
      .optional(),
    createdBy: z
      .union([z.lazy(() => StringFilterObjectSchema), z.string()])
      .optional(),
    endpoint: z
      .union([z.lazy(() => StringFilterObjectSchema), z.string()])
      .optional(),
    frequency: z
      .union([z.lazy(() => StringFilterObjectSchema), z.string()])
      .optional(),
    name: z
      .union([z.lazy(() => StringFilterObjectSchema), z.string()])
      .optional(),
    deleted: z
      .union([z.lazy(() => BoolFilterObjectSchema), z.boolean()])
      .optional(),
    flowRuns: z.lazy(() => FlowRunListRelationFilterObjectSchema).optional(),
  })
  .strict();

export const ScheduledJobWhereUniqueInputObjectSchema = Schema;
