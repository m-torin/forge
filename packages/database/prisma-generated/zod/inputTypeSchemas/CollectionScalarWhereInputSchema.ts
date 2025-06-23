import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { EnumCollectionTypeFilterSchema } from './EnumCollectionTypeFilterSchema';
import { CollectionTypeSchema } from './CollectionTypeSchema';
import { EnumContentStatusFilterSchema } from './EnumContentStatusFilterSchema';
import { ContentStatusSchema } from './ContentStatusSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { JsonFilterSchema } from './JsonFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';

export const CollectionScalarWhereInputSchema: z.ZodType<Prisma.CollectionScalarWhereInput> = z
  .object({
    AND: z
      .union([
        z.lazy(() => CollectionScalarWhereInputSchema),
        z.lazy(() => CollectionScalarWhereInputSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => CollectionScalarWhereInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => CollectionScalarWhereInputSchema),
        z.lazy(() => CollectionScalarWhereInputSchema).array(),
      ])
      .optional(),
    id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    name: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    slug: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    type: z
      .union([z.lazy(() => EnumCollectionTypeFilterSchema), z.lazy(() => CollectionTypeSchema)])
      .optional(),
    status: z
      .union([z.lazy(() => EnumContentStatusFilterSchema), z.lazy(() => ContentStatusSchema)])
      .optional(),
    userId: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    copy: z.lazy(() => JsonFilterSchema).optional(),
    parentId: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    deletedAt: z
      .union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
      .optional()
      .nullable(),
    deletedById: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
  })
  .strict();

export default CollectionScalarWhereInputSchema;
