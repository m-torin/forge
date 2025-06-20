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
import { ProductCreateNestedOneWithoutChildrenInputSchema } from './ProductCreateNestedOneWithoutChildrenInputSchema';
import { ProductCreateNestedManyWithoutParentInputSchema } from './ProductCreateNestedManyWithoutParentInputSchema';
import { PdpJoinCreateNestedManyWithoutProductInputSchema } from './PdpJoinCreateNestedManyWithoutProductInputSchema';
import { CollectionCreateNestedManyWithoutProductsInputSchema } from './CollectionCreateNestedManyWithoutProductsInputSchema';
import { TaxonomyCreateNestedManyWithoutProductsInputSchema } from './TaxonomyCreateNestedManyWithoutProductsInputSchema';
import { ProductCategoryCreateNestedManyWithoutProductsInputSchema } from './ProductCategoryCreateNestedManyWithoutProductsInputSchema';
import { MediaCreateNestedManyWithoutProductInputSchema } from './MediaCreateNestedManyWithoutProductInputSchema';
import { RegistryItemCreateNestedManyWithoutProductInputSchema } from './RegistryItemCreateNestedManyWithoutProductInputSchema';
import { FandomCreateNestedManyWithoutProductsInputSchema } from './FandomCreateNestedManyWithoutProductsInputSchema';
import { SeriesCreateNestedManyWithoutProductsInputSchema } from './SeriesCreateNestedManyWithoutProductsInputSchema';
import { StoryCreateNestedManyWithoutProductsInputSchema } from './StoryCreateNestedManyWithoutProductsInputSchema';
import { LocationCreateNestedManyWithoutProductsInputSchema } from './LocationCreateNestedManyWithoutProductsInputSchema';
import { CastCreateNestedManyWithoutProductsInputSchema } from './CastCreateNestedManyWithoutProductsInputSchema';
import { CartItemCreateNestedManyWithoutProductInputSchema } from './CartItemCreateNestedManyWithoutProductInputSchema';
import { CartItemCreateNestedManyWithoutVariantInputSchema } from './CartItemCreateNestedManyWithoutVariantInputSchema';
import { OrderItemCreateNestedManyWithoutProductInputSchema } from './OrderItemCreateNestedManyWithoutProductInputSchema';
import { OrderItemCreateNestedManyWithoutVariantInputSchema } from './OrderItemCreateNestedManyWithoutVariantInputSchema';
import { InventoryCreateNestedManyWithoutProductInputSchema } from './InventoryCreateNestedManyWithoutProductInputSchema';
import { InventoryCreateNestedManyWithoutVariantInputSchema } from './InventoryCreateNestedManyWithoutVariantInputSchema';
import { ProductIdentifiersCreateNestedManyWithoutProductInputSchema } from './ProductIdentifiersCreateNestedManyWithoutProductInputSchema';
import { UserCreateNestedOneWithoutDeletedProductsInputSchema } from './UserCreateNestedOneWithoutDeletedProductsInputSchema';
import { ReviewCreateNestedManyWithoutProductInputSchema } from './ReviewCreateNestedManyWithoutProductInputSchema';

export const ProductCreateWithoutFavoritesInputSchema: z.ZodType<Prisma.ProductCreateWithoutFavoritesInput> = z.object({
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
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  createdBy: z.string().optional().nullable(),
  deletedAt: z.coerce.date().optional().nullable(),
  aiGenerated: z.boolean().optional(),
  aiConfidence: z.number().optional().nullable(),
  aiSources: z.union([ z.lazy(() => ProductCreateaiSourcesInputSchema),z.string().array() ]).optional(),
  parent: z.lazy(() => ProductCreateNestedOneWithoutChildrenInputSchema).optional(),
  children: z.lazy(() => ProductCreateNestedManyWithoutParentInputSchema).optional(),
  soldBy: z.lazy(() => PdpJoinCreateNestedManyWithoutProductInputSchema).optional(),
  collections: z.lazy(() => CollectionCreateNestedManyWithoutProductsInputSchema).optional(),
  taxonomies: z.lazy(() => TaxonomyCreateNestedManyWithoutProductsInputSchema).optional(),
  categories: z.lazy(() => ProductCategoryCreateNestedManyWithoutProductsInputSchema).optional(),
  media: z.lazy(() => MediaCreateNestedManyWithoutProductInputSchema).optional(),
  registries: z.lazy(() => RegistryItemCreateNestedManyWithoutProductInputSchema).optional(),
  fandoms: z.lazy(() => FandomCreateNestedManyWithoutProductsInputSchema).optional(),
  series: z.lazy(() => SeriesCreateNestedManyWithoutProductsInputSchema).optional(),
  stories: z.lazy(() => StoryCreateNestedManyWithoutProductsInputSchema).optional(),
  locations: z.lazy(() => LocationCreateNestedManyWithoutProductsInputSchema).optional(),
  casts: z.lazy(() => CastCreateNestedManyWithoutProductsInputSchema).optional(),
  cartItems: z.lazy(() => CartItemCreateNestedManyWithoutProductInputSchema).optional(),
  cartItemVariants: z.lazy(() => CartItemCreateNestedManyWithoutVariantInputSchema).optional(),
  orderItems: z.lazy(() => OrderItemCreateNestedManyWithoutProductInputSchema).optional(),
  orderItemVariants: z.lazy(() => OrderItemCreateNestedManyWithoutVariantInputSchema).optional(),
  inventory: z.lazy(() => InventoryCreateNestedManyWithoutProductInputSchema).optional(),
  inventoryVariants: z.lazy(() => InventoryCreateNestedManyWithoutVariantInputSchema).optional(),
  identifiers: z.lazy(() => ProductIdentifiersCreateNestedManyWithoutProductInputSchema).optional(),
  deletedBy: z.lazy(() => UserCreateNestedOneWithoutDeletedProductsInputSchema).optional(),
  reviews: z.lazy(() => ReviewCreateNestedManyWithoutProductInputSchema).optional()
}).strict();

export default ProductCreateWithoutFavoritesInputSchema;
