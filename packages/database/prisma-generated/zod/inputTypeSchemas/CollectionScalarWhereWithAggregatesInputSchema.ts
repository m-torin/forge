import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { EnumCollectionTypeWithAggregatesFilterSchema } from './EnumCollectionTypeWithAggregatesFilterSchema';
import { CollectionTypeSchema } from './CollectionTypeSchema';
import { EnumContentStatusWithAggregatesFilterSchema } from './EnumContentStatusWithAggregatesFilterSchema';
import { ContentStatusSchema } from './ContentStatusSchema';
import { StringNullableWithAggregatesFilterSchema } from './StringNullableWithAggregatesFilterSchema';
import { JsonWithAggregatesFilterSchema } from './JsonWithAggregatesFilterSchema';
import { DateTimeWithAggregatesFilterSchema } from './DateTimeWithAggregatesFilterSchema';
import { DateTimeNullableWithAggregatesFilterSchema } from './DateTimeNullableWithAggregatesFilterSchema';

export const CollectionScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.CollectionScalarWhereWithAggregatesInput> =
  z
    .object({
      AND: z
        .union([
          z.lazy(() => CollectionScalarWhereWithAggregatesInputSchema),
          z.lazy(() => CollectionScalarWhereWithAggregatesInputSchema).array(),
        ])
        .optional(),
      OR: z
        .lazy(() => CollectionScalarWhereWithAggregatesInputSchema)
        .array()
        .optional(),
      NOT: z
        .union([
          z.lazy(() => CollectionScalarWhereWithAggregatesInputSchema),
          z.lazy(() => CollectionScalarWhereWithAggregatesInputSchema).array(),
        ])
        .optional(),
      id: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
      name: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
      slug: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
      type: z
        .union([
          z.lazy(() => EnumCollectionTypeWithAggregatesFilterSchema),
          z.lazy(() => CollectionTypeSchema),
        ])
        .optional(),
      status: z
        .union([
          z.lazy(() => EnumContentStatusWithAggregatesFilterSchema),
          z.lazy(() => ContentStatusSchema),
        ])
        .optional(),
      userId: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      copy: z.lazy(() => JsonWithAggregatesFilterSchema).optional(),
      parentId: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      createdAt: z
        .union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()])
        .optional(),
      updatedAt: z
        .union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()])
        .optional(),
      deletedAt: z
        .union([z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date()])
        .optional()
        .nullable(),
      deletedById: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
    })
    .strict();

export default CollectionScalarWhereWithAggregatesInputSchema;
