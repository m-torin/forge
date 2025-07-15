import { z } from 'zod';
import { StringWithAggregatesFilterObjectSchema } from './StringWithAggregatesFilter.schema';
import { IntWithAggregatesFilterObjectSchema } from './IntWithAggregatesFilter.schema';
import { BoolNullableWithAggregatesFilterObjectSchema } from './BoolNullableWithAggregatesFilter.schema';
import { JsonNullableWithAggregatesFilterObjectSchema } from './JsonNullableWithAggregatesFilter.schema';
import { EnumRunStatusWithAggregatesFilterObjectSchema } from './EnumRunStatusWithAggregatesFilter.schema';
import { RunStatusSchema } from '../enums/RunStatus.schema';
import { IntNullableWithAggregatesFilterObjectSchema } from './IntNullableWithAggregatesFilter.schema';
import { EnumStartedByWithAggregatesFilterObjectSchema } from './EnumStartedByWithAggregatesFilter.schema';
import { StartedBySchema } from '../enums/StartedBy.schema';
import { DateTimeNullableWithAggregatesFilterObjectSchema } from './DateTimeNullableWithAggregatesFilter.schema';
import { DateTimeWithAggregatesFilterObjectSchema } from './DateTimeWithAggregatesFilter.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    AND: z
      .union([
        z.lazy(() => FlowRunScalarWhereWithAggregatesInputObjectSchema),
        z.lazy(() => FlowRunScalarWhereWithAggregatesInputObjectSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => FlowRunScalarWhereWithAggregatesInputObjectSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => FlowRunScalarWhereWithAggregatesInputObjectSchema),
        z.lazy(() => FlowRunScalarWhereWithAggregatesInputObjectSchema).array(),
      ])
      .optional(),
    flowId: z
      .union([z.lazy(() => StringWithAggregatesFilterObjectSchema), z.string()])
      .optional(),
    id: z
      .union([
        z.lazy(() => IntWithAggregatesFilterObjectSchema),
        z.number().int(),
      ])
      .optional(),
    isScheduled: z
      .union([
        z.lazy(() => BoolNullableWithAggregatesFilterObjectSchema),
        z.boolean(),
      ])
      .optional()
      .nullable(),
    payload: z
      .lazy(() => JsonNullableWithAggregatesFilterObjectSchema)
      .optional(),
    metadata: z
      .lazy(() => JsonNullableWithAggregatesFilterObjectSchema)
      .optional(),
    runStatus: z
      .union([
        z.lazy(() => EnumRunStatusWithAggregatesFilterObjectSchema),
        RunStatusSchema,
      ])
      .optional(),
    scheduledJobId: z
      .union([
        z.lazy(() => IntNullableWithAggregatesFilterObjectSchema),
        z.number().int(),
      ])
      .optional()
      .nullable(),
    startedBy: z
      .union([
        z.lazy(() => EnumStartedByWithAggregatesFilterObjectSchema),
        StartedBySchema,
      ])
      .optional(),
    timeEnded: z
      .union([
        z.lazy(() => DateTimeNullableWithAggregatesFilterObjectSchema),
        z.coerce.date(),
      ])
      .optional()
      .nullable(),
    timeStarted: z
      .union([
        z.lazy(() => DateTimeWithAggregatesFilterObjectSchema),
        z.coerce.date(),
      ])
      .optional(),
  })
  .strict();

export const FlowRunScalarWhereWithAggregatesInputObjectSchema = Schema;
