import { z } from 'zod';
import { DateTimeWithAggregatesFilterObjectSchema } from './DateTimeWithAggregatesFilter.schema';
import { StringWithAggregatesFilterObjectSchema } from './StringWithAggregatesFilter.schema';
import { BoolWithAggregatesFilterObjectSchema } from './BoolWithAggregatesFilter.schema';
import { EnumFlowMethodWithAggregatesFilterObjectSchema } from './EnumFlowMethodWithAggregatesFilter.schema';
import { FlowMethodSchema } from '../enums/FlowMethod.schema';
import { JsonNullableWithAggregatesFilterObjectSchema } from './JsonNullableWithAggregatesFilter.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    AND: z
      .union([
        z.lazy(() => FlowScalarWhereWithAggregatesInputObjectSchema),
        z.lazy(() => FlowScalarWhereWithAggregatesInputObjectSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => FlowScalarWhereWithAggregatesInputObjectSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => FlowScalarWhereWithAggregatesInputObjectSchema),
        z.lazy(() => FlowScalarWhereWithAggregatesInputObjectSchema).array(),
      ])
      .optional(),
    createdAt: z
      .union([
        z.lazy(() => DateTimeWithAggregatesFilterObjectSchema),
        z.coerce.date(),
      ])
      .optional(),
    id: z
      .union([z.lazy(() => StringWithAggregatesFilterObjectSchema), z.string()])
      .optional(),
    instanceId: z
      .union([z.lazy(() => StringWithAggregatesFilterObjectSchema), z.string()])
      .optional(),
    isEnabled: z
      .union([z.lazy(() => BoolWithAggregatesFilterObjectSchema), z.boolean()])
      .optional(),
    method: z
      .union([
        z.lazy(() => EnumFlowMethodWithAggregatesFilterObjectSchema),
        FlowMethodSchema,
      ])
      .optional(),
    name: z
      .union([z.lazy(() => StringWithAggregatesFilterObjectSchema), z.string()])
      .optional(),
    metadata: z
      .lazy(() => JsonNullableWithAggregatesFilterObjectSchema)
      .optional(),
    updatedAt: z
      .union([
        z.lazy(() => DateTimeWithAggregatesFilterObjectSchema),
        z.coerce.date(),
      ])
      .optional(),
    viewport: z
      .lazy(() => JsonNullableWithAggregatesFilterObjectSchema)
      .optional(),
    deleted: z
      .union([z.lazy(() => BoolWithAggregatesFilterObjectSchema), z.boolean()])
      .optional(),
  })
  .strict();

export const FlowScalarWhereWithAggregatesInputObjectSchema = Schema;
