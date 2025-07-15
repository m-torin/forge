import { z } from 'zod';
import { FlowEventWhereInputObjectSchema } from './FlowEventWhereInput.schema';
import { DateTimeFilterObjectSchema } from './DateTimeFilter.schema';
import { IntFilterObjectSchema } from './IntFilter.schema';
import { StringFilterObjectSchema } from './StringFilter.schema';
import { JsonNullableFilterObjectSchema } from './JsonNullableFilter.schema';
import { EnumStartedByFilterObjectSchema } from './EnumStartedByFilter.schema';
import { StartedBySchema } from '../enums/StartedBy.schema';
import { FlowRunScalarRelationFilterObjectSchema } from './FlowRunScalarRelationFilter.schema';
import { FlowRunWhereInputObjectSchema } from './FlowRunWhereInput.schema';
import { FlowScalarRelationFilterObjectSchema } from './FlowScalarRelationFilter.schema';
import { FlowWhereInputObjectSchema } from './FlowWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.FlowEventWhereUniqueInput> = z
  .object({
    id: z.number().int(),
    AND: z
      .union([
        z.lazy(() => FlowEventWhereInputObjectSchema),
        z.lazy(() => FlowEventWhereInputObjectSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => FlowEventWhereInputObjectSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => FlowEventWhereInputObjectSchema),
        z.lazy(() => FlowEventWhereInputObjectSchema).array(),
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
    nodeId: z
      .union([z.lazy(() => StringFilterObjectSchema), z.string()])
      .optional(),
    payload: z.lazy(() => JsonNullableFilterObjectSchema).optional(),
    metadata: z.lazy(() => JsonNullableFilterObjectSchema).optional(),
    startedBy: z
      .union([z.lazy(() => EnumStartedByFilterObjectSchema), StartedBySchema])
      .optional(),
    flowRun: z
      .union([
        z.lazy(() => FlowRunScalarRelationFilterObjectSchema),
        z.lazy(() => FlowRunWhereInputObjectSchema),
      ])
      .optional(),
    flow: z
      .union([
        z.lazy(() => FlowScalarRelationFilterObjectSchema),
        z.lazy(() => FlowWhereInputObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const FlowEventWhereUniqueInputObjectSchema = Schema;
