import { z } from 'zod';
import type { Prisma } from '../../client';
import { ProductIncludeSchema } from '../inputTypeSchemas/ProductIncludeSchema';
import { ProductWhereInputSchema } from '../inputTypeSchemas/ProductWhereInputSchema';
import { ProductOrderByWithRelationInputSchema } from '../inputTypeSchemas/ProductOrderByWithRelationInputSchema';
import { ProductWhereUniqueInputSchema } from '../inputTypeSchemas/ProductWhereUniqueInputSchema';
import { ProductScalarFieldEnumSchema } from '../inputTypeSchemas/ProductScalarFieldEnumSchema';
import { ProductArgsSchema } from '../outputTypeSchemas/ProductArgsSchema';
import { ProductFindManyArgsSchema } from '../outputTypeSchemas/ProductFindManyArgsSchema';
import { PdpJoinFindManyArgsSchema } from '../outputTypeSchemas/PdpJoinFindManyArgsSchema';
import { CollectionFindManyArgsSchema } from '../outputTypeSchemas/CollectionFindManyArgsSchema';
import { TaxonomyFindManyArgsSchema } from '../outputTypeSchemas/TaxonomyFindManyArgsSchema';
import { ProductCategoryFindManyArgsSchema } from '../outputTypeSchemas/ProductCategoryFindManyArgsSchema';
import { MediaFindManyArgsSchema } from '../outputTypeSchemas/MediaFindManyArgsSchema';
import { FavoriteJoinFindManyArgsSchema } from '../outputTypeSchemas/FavoriteJoinFindManyArgsSchema';
import { RegistryItemFindManyArgsSchema } from '../outputTypeSchemas/RegistryItemFindManyArgsSchema';
import { FandomFindManyArgsSchema } from '../outputTypeSchemas/FandomFindManyArgsSchema';
import { SeriesFindManyArgsSchema } from '../outputTypeSchemas/SeriesFindManyArgsSchema';
import { StoryFindManyArgsSchema } from '../outputTypeSchemas/StoryFindManyArgsSchema';
import { LocationFindManyArgsSchema } from '../outputTypeSchemas/LocationFindManyArgsSchema';
import { CastFindManyArgsSchema } from '../outputTypeSchemas/CastFindManyArgsSchema';
import { CartItemFindManyArgsSchema } from '../outputTypeSchemas/CartItemFindManyArgsSchema';
import { OrderItemFindManyArgsSchema } from '../outputTypeSchemas/OrderItemFindManyArgsSchema';
import { InventoryFindManyArgsSchema } from '../outputTypeSchemas/InventoryFindManyArgsSchema';
import { ProductIdentifiersFindManyArgsSchema } from '../outputTypeSchemas/ProductIdentifiersFindManyArgsSchema';
import { UserArgsSchema } from '../outputTypeSchemas/UserArgsSchema';
import { ReviewFindManyArgsSchema } from '../outputTypeSchemas/ReviewFindManyArgsSchema';
import { ProductCountOutputTypeArgsSchema } from '../outputTypeSchemas/ProductCountOutputTypeArgsSchema';
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const ProductSelectSchema: z.ZodType<Prisma.ProductSelect> = z
  .object({
    id: z.boolean().optional(),
    name: z.boolean().optional(),
    slug: z.boolean().optional(),
    sku: z.boolean().optional(),
    category: z.boolean().optional(),
    status: z.boolean().optional(),
    brand: z.boolean().optional(),
    price: z.boolean().optional(),
    currency: z.boolean().optional(),
    type: z.boolean().optional(),
    variantPrice: z.boolean().optional(),
    compareAtPrice: z.boolean().optional(),
    physicalProperties: z.boolean().optional(),
    displayOrder: z.boolean().optional(),
    isDefault: z.boolean().optional(),
    copy: z.boolean().optional(),
    attributes: z.boolean().optional(),
    parentId: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    createdBy: z.boolean().optional(),
    deletedAt: z.boolean().optional(),
    deletedById: z.boolean().optional(),
    aiGenerated: z.boolean().optional(),
    aiConfidence: z.boolean().optional(),
    aiSources: z.boolean().optional(),
    parent: z.union([z.boolean(), z.lazy(() => ProductArgsSchema)]).optional(),
    children: z.union([z.boolean(), z.lazy(() => ProductFindManyArgsSchema)]).optional(),
    soldBy: z.union([z.boolean(), z.lazy(() => PdpJoinFindManyArgsSchema)]).optional(),
    collections: z.union([z.boolean(), z.lazy(() => CollectionFindManyArgsSchema)]).optional(),
    taxonomies: z.union([z.boolean(), z.lazy(() => TaxonomyFindManyArgsSchema)]).optional(),
    categories: z.union([z.boolean(), z.lazy(() => ProductCategoryFindManyArgsSchema)]).optional(),
    media: z.union([z.boolean(), z.lazy(() => MediaFindManyArgsSchema)]).optional(),
    favorites: z.union([z.boolean(), z.lazy(() => FavoriteJoinFindManyArgsSchema)]).optional(),
    registries: z.union([z.boolean(), z.lazy(() => RegistryItemFindManyArgsSchema)]).optional(),
    fandoms: z.union([z.boolean(), z.lazy(() => FandomFindManyArgsSchema)]).optional(),
    series: z.union([z.boolean(), z.lazy(() => SeriesFindManyArgsSchema)]).optional(),
    stories: z.union([z.boolean(), z.lazy(() => StoryFindManyArgsSchema)]).optional(),
    locations: z.union([z.boolean(), z.lazy(() => LocationFindManyArgsSchema)]).optional(),
    casts: z.union([z.boolean(), z.lazy(() => CastFindManyArgsSchema)]).optional(),
    cartItems: z.union([z.boolean(), z.lazy(() => CartItemFindManyArgsSchema)]).optional(),
    cartItemVariants: z.union([z.boolean(), z.lazy(() => CartItemFindManyArgsSchema)]).optional(),
    orderItems: z.union([z.boolean(), z.lazy(() => OrderItemFindManyArgsSchema)]).optional(),
    orderItemVariants: z.union([z.boolean(), z.lazy(() => OrderItemFindManyArgsSchema)]).optional(),
    inventory: z.union([z.boolean(), z.lazy(() => InventoryFindManyArgsSchema)]).optional(),
    inventoryVariants: z.union([z.boolean(), z.lazy(() => InventoryFindManyArgsSchema)]).optional(),
    identifiers: z
      .union([z.boolean(), z.lazy(() => ProductIdentifiersFindManyArgsSchema)])
      .optional(),
    deletedBy: z.union([z.boolean(), z.lazy(() => UserArgsSchema)]).optional(),
    reviews: z.union([z.boolean(), z.lazy(() => ReviewFindManyArgsSchema)]).optional(),
    _count: z.union([z.boolean(), z.lazy(() => ProductCountOutputTypeArgsSchema)]).optional(),
  })
  .strict();

export const ProductFindFirstOrThrowArgsSchema: z.ZodType<Prisma.ProductFindFirstOrThrowArgs> = z
  .object({
    select: ProductSelectSchema.optional(),
    include: z.lazy(() => ProductIncludeSchema).optional(),
    where: ProductWhereInputSchema.optional(),
    orderBy: z
      .union([ProductOrderByWithRelationInputSchema.array(), ProductOrderByWithRelationInputSchema])
      .optional(),
    cursor: ProductWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z
      .union([ProductScalarFieldEnumSchema, ProductScalarFieldEnumSchema.array()])
      .optional(),
  })
  .strict();

export default ProductFindFirstOrThrowArgsSchema;
