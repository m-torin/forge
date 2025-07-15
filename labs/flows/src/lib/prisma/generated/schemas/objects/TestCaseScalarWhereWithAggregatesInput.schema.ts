import { z } from 'zod';
import { EnumMantineColorWithAggregatesFilterObjectSchema } from './EnumMantineColorWithAggregatesFilter.schema';
import { MantineColorSchema } from '../enums/MantineColor.schema';
import { DateTimeWithAggregatesFilterObjectSchema } from './DateTimeWithAggregatesFilter.schema';
import { StringWithAggregatesFilterObjectSchema } from './StringWithAggregatesFilter.schema';
import { StringNullableWithAggregatesFilterObjectSchema } from './StringNullableWithAggregatesFilter.schema';
import { JsonNullableWithAggregatesFilterObjectSchema } from './JsonNullableWithAggregatesFilter.schema';
import { BoolWithAggregatesFilterObjectSchema } from './BoolWithAggregatesFilter.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    AND: z
      .union([
        z.lazy(() => TestCaseScalarWhereWithAggregatesInputObjectSchema),
        z
          .lazy(() => TestCaseScalarWhereWithAggregatesInputObjectSchema)
          .array(),
      ])
      .optional(),
    OR: z
      .lazy(() => TestCaseScalarWhereWithAggregatesInputObjectSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => TestCaseScalarWhereWithAggregatesInputObjectSchema),
        z
          .lazy(() => TestCaseScalarWhereWithAggregatesInputObjectSchema)
          .array(),
      ])
      .optional(),
    color: z
      .union([
        z.lazy(() => EnumMantineColorWithAggregatesFilterObjectSchema),
        MantineColorSchema,
      ])
      .optional(),
    createdAt: z
      .union([
        z.lazy(() => DateTimeWithAggregatesFilterObjectSchema),
        z.coerce.date(),
      ])
      .optional(),
    flowId: z
      .union([z.lazy(() => StringWithAggregatesFilterObjectSchema), z.string()])
      .optional(),
    id: z
      .union([z.lazy(() => StringWithAggregatesFilterObjectSchema), z.string()])
      .optional(),
    name: z
      .union([
        z.lazy(() => StringNullableWithAggregatesFilterObjectSchema),
        z.string(),
      ])
      .optional()
      .nullable(),
    metadata: z
      .lazy(() => JsonNullableWithAggregatesFilterObjectSchema)
      .optional(),
    updatedAt: z
      .union([
        z.lazy(() => DateTimeWithAggregatesFilterObjectSchema),
        z.coerce.date(),
      ])
      .optional(),
    deleted: z
      .union([z.lazy(() => BoolWithAggregatesFilterObjectSchema), z.boolean()])
      .optional(),
  })
  .strict();

export const TestCaseScalarWhereWithAggregatesInputObjectSchema = Schema;
