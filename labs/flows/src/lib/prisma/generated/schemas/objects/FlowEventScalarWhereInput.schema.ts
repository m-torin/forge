import { z } from 'zod';
import { DateTimeFilterObjectSchema } from './DateTimeFilter.schema';
import { IntFilterObjectSchema } from './IntFilter.schema';
import { StringFilterObjectSchema } from './StringFilter.schema';
import { JsonNullableFilterObjectSchema } from './JsonNullableFilter.schema';
import { EnumStartedByFilterObjectSchema } from './EnumStartedByFilter.schema';
import { StartedBySchema } from '../enums/StartedBy.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.FlowEventScalarWhereInput> = z
  .object({
    AND: z
      .union([
        z.lazy(() => FlowEventScalarWhereInputObjectSchema),
        z.lazy(() => FlowEventScalarWhereInputObjectSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => FlowEventScalarWhereInputObjectSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => FlowEventScalarWhereInputObjectSchema),
        z.lazy(() => FlowEventScalarWhereInputObjectSchema).array(),
      ])
      .optional(),
    createdAt: z
      .union([z.lazy(() => DateTimeFilterObjectSchema), z.coerce.date()])
      .optional(),
    flowRunId: z
      .union([z.lazy(() => IntFilterObjectSchema), z.number().int()])
      .optional(),
    flowId: z
      .union([z.lazy(() => StringFilterObjectSchema), z.string()])
      .optional(),
    id: z
      .union([z.lazy(() => IntFilterObjectSchema), z.number().int()])
      .optional(),
    nodeId: z
      .union([z.lazy(() => StringFilterObjectSchema), z.string()])
      .optional(),
    payload: z.lazy(() => JsonNullableFilterObjectSchema).optional(),
    metadata: z.lazy(() => JsonNullableFilterObjectSchema).optional(),
    startedBy: z
      .union([z.lazy(() => EnumStartedByFilterObjectSchema), StartedBySchema])
      .optional(),
  })
  .strict();

export const FlowEventScalarWhereInputObjectSchema = Schema;
