import { z } from 'zod';
import { DateTimeFilterObjectSchema } from './DateTimeFilter.schema';
import { StringFilterObjectSchema } from './StringFilter.schema';
import { BoolFilterObjectSchema } from './BoolFilter.schema';
import { EnumFlowMethodFilterObjectSchema } from './EnumFlowMethodFilter.schema';
import { FlowMethodSchema } from '../enums/FlowMethod.schema';
import { JsonNullableFilterObjectSchema } from './JsonNullableFilter.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.FlowScalarWhereInput> = z
  .object({
    AND: z
      .union([
        z.lazy(() => FlowScalarWhereInputObjectSchema),
        z.lazy(() => FlowScalarWhereInputObjectSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => FlowScalarWhereInputObjectSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => FlowScalarWhereInputObjectSchema),
        z.lazy(() => FlowScalarWhereInputObjectSchema).array(),
      ])
      .optional(),
    createdAt: z
      .union([z.lazy(() => DateTimeFilterObjectSchema), z.coerce.date()])
      .optional(),
    id: z
      .union([z.lazy(() => StringFilterObjectSchema), z.string()])
      .optional(),
    instanceId: z
      .union([z.lazy(() => StringFilterObjectSchema), z.string()])
      .optional(),
    isEnabled: z
      .union([z.lazy(() => BoolFilterObjectSchema), z.boolean()])
      .optional(),
    method: z
      .union([z.lazy(() => EnumFlowMethodFilterObjectSchema), FlowMethodSchema])
      .optional(),
    name: z
      .union([z.lazy(() => StringFilterObjectSchema), z.string()])
      .optional(),
    metadata: z.lazy(() => JsonNullableFilterObjectSchema).optional(),
    updatedAt: z
      .union([z.lazy(() => DateTimeFilterObjectSchema), z.coerce.date()])
      .optional(),
    viewport: z.lazy(() => JsonNullableFilterObjectSchema).optional(),
    deleted: z
      .union([z.lazy(() => BoolFilterObjectSchema), z.boolean()])
      .optional(),
  })
  .strict();

export const FlowScalarWhereInputObjectSchema = Schema;
