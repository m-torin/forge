import { z } from 'zod';
import { StringFilterObjectSchema } from './StringFilter.schema';
import { IntFilterObjectSchema } from './IntFilter.schema';
import { BoolNullableFilterObjectSchema } from './BoolNullableFilter.schema';
import { JsonNullableFilterObjectSchema } from './JsonNullableFilter.schema';
import { EnumRunStatusFilterObjectSchema } from './EnumRunStatusFilter.schema';
import { RunStatusSchema } from '../enums/RunStatus.schema';
import { IntNullableFilterObjectSchema } from './IntNullableFilter.schema';
import { EnumStartedByFilterObjectSchema } from './EnumStartedByFilter.schema';
import { StartedBySchema } from '../enums/StartedBy.schema';
import { DateTimeNullableFilterObjectSchema } from './DateTimeNullableFilter.schema';
import { DateTimeFilterObjectSchema } from './DateTimeFilter.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.FlowRunScalarWhereInput> = z
  .object({
    AND: z
      .union([
        z.lazy(() => FlowRunScalarWhereInputObjectSchema),
        z.lazy(() => FlowRunScalarWhereInputObjectSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => FlowRunScalarWhereInputObjectSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => FlowRunScalarWhereInputObjectSchema),
        z.lazy(() => FlowRunScalarWhereInputObjectSchema).array(),
      ])
      .optional(),
    flowId: z
      .union([z.lazy(() => StringFilterObjectSchema), z.string()])
      .optional(),
    id: z
      .union([z.lazy(() => IntFilterObjectSchema), z.number().int()])
      .optional(),
    isScheduled: z
      .union([z.lazy(() => BoolNullableFilterObjectSchema), z.boolean()])
      .optional()
      .nullable(),
    payload: z.lazy(() => JsonNullableFilterObjectSchema).optional(),
    metadata: z.lazy(() => JsonNullableFilterObjectSchema).optional(),
    runStatus: z
      .union([z.lazy(() => EnumRunStatusFilterObjectSchema), RunStatusSchema])
      .optional(),
    scheduledJobId: z
      .union([z.lazy(() => IntNullableFilterObjectSchema), z.number().int()])
      .optional()
      .nullable(),
    startedBy: z
      .union([z.lazy(() => EnumStartedByFilterObjectSchema), StartedBySchema])
      .optional(),
    timeEnded: z
      .union([
        z.lazy(() => DateTimeNullableFilterObjectSchema),
        z.coerce.date(),
      ])
      .optional()
      .nullable(),
    timeStarted: z
      .union([z.lazy(() => DateTimeFilterObjectSchema), z.coerce.date()])
      .optional(),
  })
  .strict();

export const FlowRunScalarWhereInputObjectSchema = Schema;
