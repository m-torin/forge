import { Prisma } from '../../client';
import Decimal from 'decimal.js';
import { z } from 'zod';
import { ProductStatusSchema } from './ProductStatusSchema';
import { ProductTypeSchema } from './ProductTypeSchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { NullableJsonNullValueInputSchema } from './NullableJsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { JsonNullValueInputSchema } from './JsonNullValueInputSchema';
import { ProductCreateaiSourcesInputSchema } from './ProductCreateaiSourcesInputSchema';
import { ProductUncheckedCreateNestedManyWithoutParentInputSchema } from './ProductUncheckedCreateNestedManyWithoutParentInputSchema';
import { PdpJoinUncheckedCreateNestedManyWithoutProductInputSchema } from './PdpJoinUncheckedCreateNestedManyWithoutProductInputSchema';
import { CollectionUncheckedCreateNestedManyWithoutProductsInputSchema } from './CollectionUncheckedCreateNestedManyWithoutProductsInputSchema';
import { TaxonomyUncheckedCreateNestedManyWithoutProductsInputSchema } from './TaxonomyUncheckedCreateNestedManyWithoutProductsInputSchema';
import { ProductCategoryUncheckedCreateNestedManyWithoutProductsInputSchema } from './ProductCategoryUncheckedCreateNestedManyWithoutProductsInputSchema';
import { MediaUncheckedCreateNestedManyWithoutProductInputSchema } from './MediaUncheckedCreateNestedManyWithoutProductInputSchema';
import { FavoriteJoinUncheckedCreateNestedManyWithoutProductInputSchema } from './FavoriteJoinUncheckedCreateNestedManyWithoutProductInputSchema';
import { RegistryItemUncheckedCreateNestedManyWithoutProductInputSchema } from './RegistryItemUncheckedCreateNestedManyWithoutProductInputSchema';
import { FandomUncheckedCreateNestedManyWithoutProductsInputSchema } from './FandomUncheckedCreateNestedManyWithoutProductsInputSchema';
import { SeriesUncheckedCreateNestedManyWithoutProductsInputSchema } from './SeriesUncheckedCreateNestedManyWithoutProductsInputSchema';
import { StoryUncheckedCreateNestedManyWithoutProductsInputSchema } from './StoryUncheckedCreateNestedManyWithoutProductsInputSchema';
import { LocationUncheckedCreateNestedManyWithoutProductsInputSchema } from './LocationUncheckedCreateNestedManyWithoutProductsInputSchema';
import { CastUncheckedCreateNestedManyWithoutProductsInputSchema } from './CastUncheckedCreateNestedManyWithoutProductsInputSchema';
import { CartItemUncheckedCreateNestedManyWithoutProductInputSchema } from './CartItemUncheckedCreateNestedManyWithoutProductInputSchema';
import { CartItemUncheckedCreateNestedManyWithoutVariantInputSchema } from './CartItemUncheckedCreateNestedManyWithoutVariantInputSchema';
import { OrderItemUncheckedCreateNestedManyWithoutProductInputSchema } from './OrderItemUncheckedCreateNestedManyWithoutProductInputSchema';
import { OrderItemUncheckedCreateNestedManyWithoutVariantInputSchema } from './OrderItemUncheckedCreateNestedManyWithoutVariantInputSchema';
import { InventoryUncheckedCreateNestedManyWithoutProductInputSchema } from './InventoryUncheckedCreateNestedManyWithoutProductInputSchema';
import { InventoryUncheckedCreateNestedManyWithoutVariantInputSchema } from './InventoryUncheckedCreateNestedManyWithoutVariantInputSchema';
import { ProductIdentifiersUncheckedCreateNestedManyWithoutProductInputSchema } from './ProductIdentifiersUncheckedCreateNestedManyWithoutProductInputSchema';
import { ReviewUncheckedCreateNestedManyWithoutProductInputSchema } from './ReviewUncheckedCreateNestedManyWithoutProductInputSchema';

export const ProductUncheckedCreateInputSchema: z.ZodType<Prisma.ProductUncheckedCreateInput> = z.object({
  id: z.string().cuid().optional(),
  name: z.string(),
  slug: z.string(),
  sku: z.string(),
  category: z.string(),
  status: z.lazy(() => ProductStatusSchema).optional(),
  brand: z.string().optional().nullable(),
  price: z.number().optional().nullable(),
  currency: z.string().optional().nullable(),
  type: z.lazy(() => ProductTypeSchema).optional(),
  variantPrice: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  compareAtPrice: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional().nullable(),
  physicalProperties: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  displayOrder: z.number().int().optional(),
  isDefault: z.boolean().optional(),
  copy: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]),
  attributes: z.union([ z.lazy(() => JsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  parentId: z.string().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  createdBy: z.string().optional().nullable(),
  deletedAt: z.coerce.date().optional().nullable(),
  deletedById: z.string().optional().nullable(),
  aiGenerated: z.boolean().optional(),
  aiConfidence: z.number().optional().nullable(),
  aiSources: z.union([ z.lazy(() => ProductCreateaiSourcesInputSchema),z.string().array() ]).optional(),
  children: z.lazy(() => ProductUncheckedCreateNestedManyWithoutParentInputSchema).optional(),
  soldBy: z.lazy(() => PdpJoinUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
  collections: z.lazy(() => CollectionUncheckedCreateNestedManyWithoutProductsInputSchema).optional(),
  taxonomies: z.lazy(() => TaxonomyUncheckedCreateNestedManyWithoutProductsInputSchema).optional(),
  categories: z.lazy(() => ProductCategoryUncheckedCreateNestedManyWithoutProductsInputSchema).optional(),
  media: z.lazy(() => MediaUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
  favorites: z.lazy(() => FavoriteJoinUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
  registries: z.lazy(() => RegistryItemUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
  fandoms: z.lazy(() => FandomUncheckedCreateNestedManyWithoutProductsInputSchema).optional(),
  series: z.lazy(() => SeriesUncheckedCreateNestedManyWithoutProductsInputSchema).optional(),
  stories: z.lazy(() => StoryUncheckedCreateNestedManyWithoutProductsInputSchema).optional(),
  locations: z.lazy(() => LocationUncheckedCreateNestedManyWithoutProductsInputSchema).optional(),
  casts: z.lazy(() => CastUncheckedCreateNestedManyWithoutProductsInputSchema).optional(),
  cartItems: z.lazy(() => CartItemUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
  cartItemVariants: z.lazy(() => CartItemUncheckedCreateNestedManyWithoutVariantInputSchema).optional(),
  orderItems: z.lazy(() => OrderItemUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
  orderItemVariants: z.lazy(() => OrderItemUncheckedCreateNestedManyWithoutVariantInputSchema).optional(),
  inventory: z.lazy(() => InventoryUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
  inventoryVariants: z.lazy(() => InventoryUncheckedCreateNestedManyWithoutVariantInputSchema).optional(),
  identifiers: z.lazy(() => ProductIdentifiersUncheckedCreateNestedManyWithoutProductInputSchema).optional(),
  reviews: z.lazy(() => ReviewUncheckedCreateNestedManyWithoutProductInputSchema).optional()
}).strict();

export default ProductUncheckedCreateInputSchema;
