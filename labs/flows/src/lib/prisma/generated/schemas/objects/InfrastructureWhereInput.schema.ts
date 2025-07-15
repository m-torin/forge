import { z } from 'zod';
import { StringNullableFilterObjectSchema } from './StringNullableFilter.schema';
import { BoolFilterObjectSchema } from './BoolFilter.schema';
import { DateTimeFilterObjectSchema } from './DateTimeFilter.schema';
import { JsonNullableFilterObjectSchema } from './JsonNullableFilter.schema';
import { StringFilterObjectSchema } from './StringFilter.schema';
import { EnumInfraTypeFilterObjectSchema } from './EnumInfraTypeFilter.schema';
import { InfraTypeSchema } from '../enums/InfraType.schema';
import { NodeListRelationFilterObjectSchema } from './NodeListRelationFilter.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.InfrastructureWhereInput> = z
  .object({
    AND: z
      .union([
        z.lazy(() => InfrastructureWhereInputObjectSchema),
        z.lazy(() => InfrastructureWhereInputObjectSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => InfrastructureWhereInputObjectSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => InfrastructureWhereInputObjectSchema),
        z.lazy(() => InfrastructureWhereInputObjectSchema).array(),
      ])
      .optional(),
    arn: z
      .union([z.lazy(() => StringNullableFilterObjectSchema), z.string()])
      .optional()
      .nullable(),
    canControl: z
      .union([z.lazy(() => BoolFilterObjectSchema), z.boolean()])
      .optional(),
    createdAt: z
      .union([z.lazy(() => DateTimeFilterObjectSchema), z.coerce.date()])
      .optional(),
    data: z.lazy(() => JsonNullableFilterObjectSchema).optional(),
    id: z
      .union([z.lazy(() => StringFilterObjectSchema), z.string()])
      .optional(),
    name: z
      .union([z.lazy(() => StringNullableFilterObjectSchema), z.string()])
      .optional()
      .nullable(),
    type: z
      .union([z.lazy(() => EnumInfraTypeFilterObjectSchema), InfraTypeSchema])
      .optional(),
    metadata: z.lazy(() => JsonNullableFilterObjectSchema).optional(),
    updatedAt: z
      .union([z.lazy(() => DateTimeFilterObjectSchema), z.coerce.date()])
      .optional(),
    deleted: z
      .union([z.lazy(() => BoolFilterObjectSchema), z.boolean()])
      .optional(),
    nodes: z.lazy(() => NodeListRelationFilterObjectSchema).optional(),
  })
  .strict();

export const InfrastructureWhereInputObjectSchema = Schema;
