import { Prisma } from '../../client';
import Decimal from 'decimal.js';
import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { EnumProductStatusFilterSchema } from './EnumProductStatusFilterSchema';
import { ProductStatusSchema } from './ProductStatusSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { FloatNullableFilterSchema } from './FloatNullableFilterSchema';
import { EnumProductTypeFilterSchema } from './EnumProductTypeFilterSchema';
import { ProductTypeSchema } from './ProductTypeSchema';
import { DecimalNullableFilterSchema } from './DecimalNullableFilterSchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { JsonNullableFilterSchema } from './JsonNullableFilterSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { JsonFilterSchema } from './JsonFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { StringNullableListFilterSchema } from './StringNullableListFilterSchema';
import { ProductNullableScalarRelationFilterSchema } from './ProductNullableScalarRelationFilterSchema';
import { ProductListRelationFilterSchema } from './ProductListRelationFilterSchema';
import { PdpJoinListRelationFilterSchema } from './PdpJoinListRelationFilterSchema';
import { CollectionListRelationFilterSchema } from './CollectionListRelationFilterSchema';
import { TaxonomyListRelationFilterSchema } from './TaxonomyListRelationFilterSchema';
import { ProductCategoryListRelationFilterSchema } from './ProductCategoryListRelationFilterSchema';
import { MediaListRelationFilterSchema } from './MediaListRelationFilterSchema';
import { FavoriteJoinListRelationFilterSchema } from './FavoriteJoinListRelationFilterSchema';
import { RegistryItemListRelationFilterSchema } from './RegistryItemListRelationFilterSchema';
import { FandomListRelationFilterSchema } from './FandomListRelationFilterSchema';
import { SeriesListRelationFilterSchema } from './SeriesListRelationFilterSchema';
import { StoryListRelationFilterSchema } from './StoryListRelationFilterSchema';
import { LocationListRelationFilterSchema } from './LocationListRelationFilterSchema';
import { CastListRelationFilterSchema } from './CastListRelationFilterSchema';
import { CartItemListRelationFilterSchema } from './CartItemListRelationFilterSchema';
import { OrderItemListRelationFilterSchema } from './OrderItemListRelationFilterSchema';
import { InventoryListRelationFilterSchema } from './InventoryListRelationFilterSchema';
import { ProductIdentifiersListRelationFilterSchema } from './ProductIdentifiersListRelationFilterSchema';
import { UserNullableScalarRelationFilterSchema } from './UserNullableScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { ReviewListRelationFilterSchema } from './ReviewListRelationFilterSchema';

export const ProductWhereInputSchema: z.ZodType<Prisma.ProductWhereInput> = z
  .object({
    AND: z
      .union([z.lazy(() => ProductWhereInputSchema), z.lazy(() => ProductWhereInputSchema).array()])
      .optional(),
    OR: z
      .lazy(() => ProductWhereInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([z.lazy(() => ProductWhereInputSchema), z.lazy(() => ProductWhereInputSchema).array()])
      .optional(),
    id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    name: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    slug: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    sku: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    category: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    status: z
      .union([z.lazy(() => EnumProductStatusFilterSchema), z.lazy(() => ProductStatusSchema)])
      .optional(),
    brand: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    price: z
      .union([z.lazy(() => FloatNullableFilterSchema), z.number()])
      .optional()
      .nullable(),
    currency: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    type: z
      .union([z.lazy(() => EnumProductTypeFilterSchema), z.lazy(() => ProductTypeSchema)])
      .optional(),
    variantPrice: z
      .union([
        z.lazy(() => DecimalNullableFilterSchema),
        z
          .union([
            z.number(),
            z.string(),
            z.instanceof(Decimal),
            z.instanceof(Prisma.Decimal),
            DecimalJsLikeSchema,
          ])
          .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
      ])
      .optional()
      .nullable(),
    compareAtPrice: z
      .union([
        z.lazy(() => DecimalNullableFilterSchema),
        z
          .union([
            z.number(),
            z.string(),
            z.instanceof(Decimal),
            z.instanceof(Prisma.Decimal),
            DecimalJsLikeSchema,
          ])
          .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
      ])
      .optional()
      .nullable(),
    physicalProperties: z.lazy(() => JsonNullableFilterSchema).optional(),
    displayOrder: z.union([z.lazy(() => IntFilterSchema), z.number()]).optional(),
    isDefault: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
    copy: z.lazy(() => JsonFilterSchema).optional(),
    attributes: z.lazy(() => JsonFilterSchema).optional(),
    parentId: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    createdBy: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    deletedAt: z
      .union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
      .optional()
      .nullable(),
    deletedById: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    aiGenerated: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
    aiConfidence: z
      .union([z.lazy(() => FloatNullableFilterSchema), z.number()])
      .optional()
      .nullable(),
    aiSources: z.lazy(() => StringNullableListFilterSchema).optional(),
    parent: z
      .union([
        z.lazy(() => ProductNullableScalarRelationFilterSchema),
        z.lazy(() => ProductWhereInputSchema),
      ])
      .optional()
      .nullable(),
    children: z.lazy(() => ProductListRelationFilterSchema).optional(),
    soldBy: z.lazy(() => PdpJoinListRelationFilterSchema).optional(),
    collections: z.lazy(() => CollectionListRelationFilterSchema).optional(),
    taxonomies: z.lazy(() => TaxonomyListRelationFilterSchema).optional(),
    categories: z.lazy(() => ProductCategoryListRelationFilterSchema).optional(),
    media: z.lazy(() => MediaListRelationFilterSchema).optional(),
    favorites: z.lazy(() => FavoriteJoinListRelationFilterSchema).optional(),
    registries: z.lazy(() => RegistryItemListRelationFilterSchema).optional(),
    fandoms: z.lazy(() => FandomListRelationFilterSchema).optional(),
    series: z.lazy(() => SeriesListRelationFilterSchema).optional(),
    stories: z.lazy(() => StoryListRelationFilterSchema).optional(),
    locations: z.lazy(() => LocationListRelationFilterSchema).optional(),
    casts: z.lazy(() => CastListRelationFilterSchema).optional(),
    cartItems: z.lazy(() => CartItemListRelationFilterSchema).optional(),
    cartItemVariants: z.lazy(() => CartItemListRelationFilterSchema).optional(),
    orderItems: z.lazy(() => OrderItemListRelationFilterSchema).optional(),
    orderItemVariants: z.lazy(() => OrderItemListRelationFilterSchema).optional(),
    inventory: z.lazy(() => InventoryListRelationFilterSchema).optional(),
    inventoryVariants: z.lazy(() => InventoryListRelationFilterSchema).optional(),
    identifiers: z.lazy(() => ProductIdentifiersListRelationFilterSchema).optional(),
    deletedBy: z
      .union([
        z.lazy(() => UserNullableScalarRelationFilterSchema),
        z.lazy(() => UserWhereInputSchema),
      ])
      .optional()
      .nullable(),
    reviews: z.lazy(() => ReviewListRelationFilterSchema).optional(),
  })
  .strict();

export default ProductWhereInputSchema;
