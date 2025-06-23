import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { ProductOrderByRelationAggregateInputSchema } from './ProductOrderByRelationAggregateInputSchema';
import { PdpJoinOrderByRelationAggregateInputSchema } from './PdpJoinOrderByRelationAggregateInputSchema';
import { CollectionOrderByRelationAggregateInputSchema } from './CollectionOrderByRelationAggregateInputSchema';
import { TaxonomyOrderByRelationAggregateInputSchema } from './TaxonomyOrderByRelationAggregateInputSchema';
import { ProductCategoryOrderByRelationAggregateInputSchema } from './ProductCategoryOrderByRelationAggregateInputSchema';
import { MediaOrderByRelationAggregateInputSchema } from './MediaOrderByRelationAggregateInputSchema';
import { FavoriteJoinOrderByRelationAggregateInputSchema } from './FavoriteJoinOrderByRelationAggregateInputSchema';
import { RegistryItemOrderByRelationAggregateInputSchema } from './RegistryItemOrderByRelationAggregateInputSchema';
import { FandomOrderByRelationAggregateInputSchema } from './FandomOrderByRelationAggregateInputSchema';
import { SeriesOrderByRelationAggregateInputSchema } from './SeriesOrderByRelationAggregateInputSchema';
import { StoryOrderByRelationAggregateInputSchema } from './StoryOrderByRelationAggregateInputSchema';
import { LocationOrderByRelationAggregateInputSchema } from './LocationOrderByRelationAggregateInputSchema';
import { CastOrderByRelationAggregateInputSchema } from './CastOrderByRelationAggregateInputSchema';
import { CartItemOrderByRelationAggregateInputSchema } from './CartItemOrderByRelationAggregateInputSchema';
import { OrderItemOrderByRelationAggregateInputSchema } from './OrderItemOrderByRelationAggregateInputSchema';
import { InventoryOrderByRelationAggregateInputSchema } from './InventoryOrderByRelationAggregateInputSchema';
import { ProductIdentifiersOrderByRelationAggregateInputSchema } from './ProductIdentifiersOrderByRelationAggregateInputSchema';
import { UserOrderByWithRelationInputSchema } from './UserOrderByWithRelationInputSchema';
import { ReviewOrderByRelationAggregateInputSchema } from './ReviewOrderByRelationAggregateInputSchema';

export const ProductOrderByWithRelationInputSchema: z.ZodType<Prisma.ProductOrderByWithRelationInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      name: z.lazy(() => SortOrderSchema).optional(),
      slug: z.lazy(() => SortOrderSchema).optional(),
      sku: z.lazy(() => SortOrderSchema).optional(),
      category: z.lazy(() => SortOrderSchema).optional(),
      status: z.lazy(() => SortOrderSchema).optional(),
      brand: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      price: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      currency: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      type: z.lazy(() => SortOrderSchema).optional(),
      variantPrice: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      compareAtPrice: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      physicalProperties: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      displayOrder: z.lazy(() => SortOrderSchema).optional(),
      isDefault: z.lazy(() => SortOrderSchema).optional(),
      copy: z.lazy(() => SortOrderSchema).optional(),
      attributes: z.lazy(() => SortOrderSchema).optional(),
      parentId: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
      createdBy: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      deletedAt: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      deletedById: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      aiGenerated: z.lazy(() => SortOrderSchema).optional(),
      aiConfidence: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      aiSources: z.lazy(() => SortOrderSchema).optional(),
      parent: z.lazy(() => ProductOrderByWithRelationInputSchema).optional(),
      children: z.lazy(() => ProductOrderByRelationAggregateInputSchema).optional(),
      soldBy: z.lazy(() => PdpJoinOrderByRelationAggregateInputSchema).optional(),
      collections: z.lazy(() => CollectionOrderByRelationAggregateInputSchema).optional(),
      taxonomies: z.lazy(() => TaxonomyOrderByRelationAggregateInputSchema).optional(),
      categories: z.lazy(() => ProductCategoryOrderByRelationAggregateInputSchema).optional(),
      media: z.lazy(() => MediaOrderByRelationAggregateInputSchema).optional(),
      favorites: z.lazy(() => FavoriteJoinOrderByRelationAggregateInputSchema).optional(),
      registries: z.lazy(() => RegistryItemOrderByRelationAggregateInputSchema).optional(),
      fandoms: z.lazy(() => FandomOrderByRelationAggregateInputSchema).optional(),
      series: z.lazy(() => SeriesOrderByRelationAggregateInputSchema).optional(),
      stories: z.lazy(() => StoryOrderByRelationAggregateInputSchema).optional(),
      locations: z.lazy(() => LocationOrderByRelationAggregateInputSchema).optional(),
      casts: z.lazy(() => CastOrderByRelationAggregateInputSchema).optional(),
      cartItems: z.lazy(() => CartItemOrderByRelationAggregateInputSchema).optional(),
      cartItemVariants: z.lazy(() => CartItemOrderByRelationAggregateInputSchema).optional(),
      orderItems: z.lazy(() => OrderItemOrderByRelationAggregateInputSchema).optional(),
      orderItemVariants: z.lazy(() => OrderItemOrderByRelationAggregateInputSchema).optional(),
      inventory: z.lazy(() => InventoryOrderByRelationAggregateInputSchema).optional(),
      inventoryVariants: z.lazy(() => InventoryOrderByRelationAggregateInputSchema).optional(),
      identifiers: z.lazy(() => ProductIdentifiersOrderByRelationAggregateInputSchema).optional(),
      deletedBy: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
      reviews: z.lazy(() => ReviewOrderByRelationAggregateInputSchema).optional(),
    })
    .strict();

export default ProductOrderByWithRelationInputSchema;
