import { z } from 'zod';
import { EnumMantineColorFilterObjectSchema } from './EnumMantineColorFilter.schema';
import { MantineColorSchema } from '../enums/MantineColor.schema';
import { DateTimeFilterObjectSchema } from './DateTimeFilter.schema';
import { StringFilterObjectSchema } from './StringFilter.schema';
import { StringNullableFilterObjectSchema } from './StringNullableFilter.schema';
import { JsonNullableFilterObjectSchema } from './JsonNullableFilter.schema';
import { BoolFilterObjectSchema } from './BoolFilter.schema';
import { FlowScalarRelationFilterObjectSchema } from './FlowScalarRelationFilter.schema';
import { FlowWhereInputObjectSchema } from './FlowWhereInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.TestCaseWhereInput> = z
  .object({
    AND: z
      .union([
        z.lazy(() => TestCaseWhereInputObjectSchema),
        z.lazy(() => TestCaseWhereInputObjectSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => TestCaseWhereInputObjectSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => TestCaseWhereInputObjectSchema),
        z.lazy(() => TestCaseWhereInputObjectSchema).array(),
      ])
      .optional(),
    color: z
      .union([
        z.lazy(() => EnumMantineColorFilterObjectSchema),
        MantineColorSchema,
      ])
      .optional(),
    createdAt: z
      .union([z.lazy(() => DateTimeFilterObjectSchema), z.coerce.date()])
      .optional(),
    flowId: z
      .union([z.lazy(() => StringFilterObjectSchema), z.string()])
      .optional(),
    id: z
      .union([z.lazy(() => StringFilterObjectSchema), z.string()])
      .optional(),
    name: z
      .union([z.lazy(() => StringNullableFilterObjectSchema), z.string()])
      .optional()
      .nullable(),
    metadata: z.lazy(() => JsonNullableFilterObjectSchema).optional(),
    updatedAt: z
      .union([z.lazy(() => DateTimeFilterObjectSchema), z.coerce.date()])
      .optional(),
    deleted: z
      .union([z.lazy(() => BoolFilterObjectSchema), z.boolean()])
      .optional(),
    flow: z
      .union([
        z.lazy(() => FlowScalarRelationFilterObjectSchema),
        z.lazy(() => FlowWhereInputObjectSchema),
      ])
      .optional(),
  })
  .strict();

export const TestCaseWhereInputObjectSchema = Schema;
