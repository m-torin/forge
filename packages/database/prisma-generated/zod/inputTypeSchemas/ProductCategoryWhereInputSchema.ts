import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { EnumContentStatusFilterSchema } from './EnumContentStatusFilterSchema';
import { ContentStatusSchema } from './ContentStatusSchema';
import { JsonFilterSchema } from './JsonFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { ProductCategoryNullableScalarRelationFilterSchema } from './ProductCategoryNullableScalarRelationFilterSchema';
import { ProductCategoryListRelationFilterSchema } from './ProductCategoryListRelationFilterSchema';
import { ProductListRelationFilterSchema } from './ProductListRelationFilterSchema';
import { CollectionListRelationFilterSchema } from './CollectionListRelationFilterSchema';
import { MediaListRelationFilterSchema } from './MediaListRelationFilterSchema';
import { UserNullableScalarRelationFilterSchema } from './UserNullableScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';

export const ProductCategoryWhereInputSchema: z.ZodType<Prisma.ProductCategoryWhereInput> = z
  .object({
    AND: z
      .union([
        z.lazy(() => ProductCategoryWhereInputSchema),
        z.lazy(() => ProductCategoryWhereInputSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => ProductCategoryWhereInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => ProductCategoryWhereInputSchema),
        z.lazy(() => ProductCategoryWhereInputSchema).array(),
      ])
      .optional(),
    id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    name: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    slug: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    status: z
      .union([z.lazy(() => EnumContentStatusFilterSchema), z.lazy(() => ContentStatusSchema)])
      .optional(),
    copy: z.lazy(() => JsonFilterSchema).optional(),
    parentId: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    displayOrder: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
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
    parent: z
      .union([
        z.lazy(() => ProductCategoryNullableScalarRelationFilterSchema),
        z.lazy(() => ProductCategoryWhereInputSchema),
      ])
      .optional()
      .nullable(),
    children: z.lazy(() => ProductCategoryListRelationFilterSchema).optional(),
    products: z.lazy(() => ProductListRelationFilterSchema).optional(),
    collections: z.lazy(() => CollectionListRelationFilterSchema).optional(),
    media: z.lazy(() => MediaListRelationFilterSchema).optional(),
    deletedBy: z
      .union([
        z.lazy(() => UserNullableScalarRelationFilterSchema),
        z.lazy(() => UserWhereInputSchema),
      ])
      .optional()
      .nullable(),
  })
  .strict();

export default ProductCategoryWhereInputSchema;
