import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { EnumMediaTypeFilterSchema } from './EnumMediaTypeFilterSchema';
import { MediaTypeSchema } from './MediaTypeSchema';
import { IntNullableFilterSchema } from './IntNullableFilterSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { JsonFilterSchema } from './JsonFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { UserNullableScalarRelationFilterSchema } from './UserNullableScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { ArticleNullableScalarRelationFilterSchema } from './ArticleNullableScalarRelationFilterSchema';
import { ArticleWhereInputSchema } from './ArticleWhereInputSchema';
import { BrandNullableScalarRelationFilterSchema } from './BrandNullableScalarRelationFilterSchema';
import { BrandWhereInputSchema } from './BrandWhereInputSchema';
import { CollectionNullableScalarRelationFilterSchema } from './CollectionNullableScalarRelationFilterSchema';
import { CollectionWhereInputSchema } from './CollectionWhereInputSchema';
import { ProductNullableScalarRelationFilterSchema } from './ProductNullableScalarRelationFilterSchema';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';
import { TaxonomyNullableScalarRelationFilterSchema } from './TaxonomyNullableScalarRelationFilterSchema';
import { TaxonomyWhereInputSchema } from './TaxonomyWhereInputSchema';
import { ProductCategoryNullableScalarRelationFilterSchema } from './ProductCategoryNullableScalarRelationFilterSchema';
import { ProductCategoryWhereInputSchema } from './ProductCategoryWhereInputSchema';
import { PdpJoinNullableScalarRelationFilterSchema } from './PdpJoinNullableScalarRelationFilterSchema';
import { PdpJoinWhereInputSchema } from './PdpJoinWhereInputSchema';
import { ReviewNullableScalarRelationFilterSchema } from './ReviewNullableScalarRelationFilterSchema';
import { ReviewWhereInputSchema } from './ReviewWhereInputSchema';

export const MediaWhereInputSchema: z.ZodType<Prisma.MediaWhereInput> = z
  .object({
    AND: z
      .union([z.lazy(() => MediaWhereInputSchema), z.lazy(() => MediaWhereInputSchema).array()])
      .optional(),
    OR: z
      .lazy(() => MediaWhereInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([z.lazy(() => MediaWhereInputSchema), z.lazy(() => MediaWhereInputSchema).array()])
      .optional(),
    id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    url: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    altText: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    type: z
      .union([z.lazy(() => EnumMediaTypeFilterSchema), z.lazy(() => MediaTypeSchema)])
      .optional(),
    width: z
      .union([z.lazy(() => IntNullableFilterSchema), z.number()])
      .optional()
      .nullable(),
    height: z
      .union([z.lazy(() => IntNullableFilterSchema), z.number()])
      .optional()
      .nullable(),
    size: z
      .union([z.lazy(() => IntNullableFilterSchema), z.number()])
      .optional()
      .nullable(),
    mimeType: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    sortOrder: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
    userId: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    copy: z.lazy(() => JsonFilterSchema).optional(),
    articleId: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    brandId: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    collectionId: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    productId: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    taxonomyId: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    categoryId: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    pdpJoinId: z
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
    reviewId: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    user: z
      .union([
        z.lazy(() => UserNullableScalarRelationFilterSchema),
        z.lazy(() => UserWhereInputSchema),
      ])
      .optional()
      .nullable(),
    article: z
      .union([
        z.lazy(() => ArticleNullableScalarRelationFilterSchema),
        z.lazy(() => ArticleWhereInputSchema),
      ])
      .optional()
      .nullable(),
    brand: z
      .union([
        z.lazy(() => BrandNullableScalarRelationFilterSchema),
        z.lazy(() => BrandWhereInputSchema),
      ])
      .optional()
      .nullable(),
    collection: z
      .union([
        z.lazy(() => CollectionNullableScalarRelationFilterSchema),
        z.lazy(() => CollectionWhereInputSchema),
      ])
      .optional()
      .nullable(),
    product: z
      .union([
        z.lazy(() => ProductNullableScalarRelationFilterSchema),
        z.lazy(() => ProductWhereInputSchema),
      ])
      .optional()
      .nullable(),
    taxonomy: z
      .union([
        z.lazy(() => TaxonomyNullableScalarRelationFilterSchema),
        z.lazy(() => TaxonomyWhereInputSchema),
      ])
      .optional()
      .nullable(),
    category: z
      .union([
        z.lazy(() => ProductCategoryNullableScalarRelationFilterSchema),
        z.lazy(() => ProductCategoryWhereInputSchema),
      ])
      .optional()
      .nullable(),
    pdpJoin: z
      .union([
        z.lazy(() => PdpJoinNullableScalarRelationFilterSchema),
        z.lazy(() => PdpJoinWhereInputSchema),
      ])
      .optional()
      .nullable(),
    deletedBy: z
      .union([
        z.lazy(() => UserNullableScalarRelationFilterSchema),
        z.lazy(() => UserWhereInputSchema),
      ])
      .optional()
      .nullable(),
    review: z
      .union([
        z.lazy(() => ReviewNullableScalarRelationFilterSchema),
        z.lazy(() => ReviewWhereInputSchema),
      ])
      .optional()
      .nullable(),
  })
  .strict();

export default MediaWhereInputSchema;
