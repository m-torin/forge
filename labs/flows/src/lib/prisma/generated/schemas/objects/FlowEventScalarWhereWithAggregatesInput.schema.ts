import { z } from 'zod';
import { DateTimeWithAggregatesFilterObjectSchema } from './DateTimeWithAggregatesFilter.schema';
import { IntWithAggregatesFilterObjectSchema } from './IntWithAggregatesFilter.schema';
import { StringWithAggregatesFilterObjectSchema } from './StringWithAggregatesFilter.schema';
import { JsonNullableWithAggregatesFilterObjectSchema } from './JsonNullableWithAggregatesFilter.schema';
import { EnumStartedByWithAggregatesFilterObjectSchema } from './EnumStartedByWithAggregatesFilter.schema';
import { StartedBySchema } from '../enums/StartedBy.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    AND: z
      .union([
        z.lazy(() => FlowEventScalarWhereWithAggregatesInputObjectSchema),
        z
          .lazy(() => FlowEventScalarWhereWithAggregatesInputObjectSchema)
          .array(),
      ])
      .optional(),
    OR: z
      .lazy(() => FlowEventScalarWhereWithAggregatesInputObjectSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => FlowEventScalarWhereWithAggregatesInputObjectSchema),
        z
          .lazy(() => FlowEventScalarWhereWithAggregatesInputObjectSchema)
          .array(),
      ])
      .optional(),
    createdAt: z
      .union([
        z.lazy(() => DateTimeWithAggregatesFilterObjectSchema),
        z.coerce.date(),
      ])
      .optional(),
    flowRunId: z
      .union([
        z.lazy(() => IntWithAggregatesFilterObjectSchema),
        z.number().int(),
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
    nodeId: z
      .union([z.lazy(() => StringWithAggregatesFilterObjectSchema), z.string()])
      .optional(),
    payload: z
      .lazy(() => JsonNullableWithAggregatesFilterObjectSchema)
      .optional(),
    metadata: z
      .lazy(() => JsonNullableWithAggregatesFilterObjectSchema)
      .optional(),
    startedBy: z
      .union([
        z.lazy(() => EnumStartedByWithAggregatesFilterObjectSchema),
        StartedBySchema,
      ])
      .optional(),
  })
  .strict();

export const FlowEventScalarWhereWithAggregatesInputObjectSchema = Schema;
