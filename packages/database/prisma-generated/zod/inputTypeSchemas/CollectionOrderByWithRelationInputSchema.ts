import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { CollectionOrderByRelationAggregateInputSchema } from './CollectionOrderByRelationAggregateInputSchema';
import { UserOrderByWithRelationInputSchema } from './UserOrderByWithRelationInputSchema';
import { ProductOrderByRelationAggregateInputSchema } from './ProductOrderByRelationAggregateInputSchema';
import { BrandOrderByRelationAggregateInputSchema } from './BrandOrderByRelationAggregateInputSchema';
import { TaxonomyOrderByRelationAggregateInputSchema } from './TaxonomyOrderByRelationAggregateInputSchema';
import { ProductCategoryOrderByRelationAggregateInputSchema } from './ProductCategoryOrderByRelationAggregateInputSchema';
import { PdpJoinOrderByRelationAggregateInputSchema } from './PdpJoinOrderByRelationAggregateInputSchema';
import { MediaOrderByRelationAggregateInputSchema } from './MediaOrderByRelationAggregateInputSchema';
import { FavoriteJoinOrderByRelationAggregateInputSchema } from './FavoriteJoinOrderByRelationAggregateInputSchema';
import { RegistryItemOrderByRelationAggregateInputSchema } from './RegistryItemOrderByRelationAggregateInputSchema';
import { ProductIdentifiersOrderByRelationAggregateInputSchema } from './ProductIdentifiersOrderByRelationAggregateInputSchema';

export const CollectionOrderByWithRelationInputSchema: z.ZodType<Prisma.CollectionOrderByWithRelationInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      name: z.lazy(() => SortOrderSchema).optional(),
      slug: z.lazy(() => SortOrderSchema).optional(),
      type: z.lazy(() => SortOrderSchema).optional(),
      status: z.lazy(() => SortOrderSchema).optional(),
      userId: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      copy: z.lazy(() => SortOrderSchema).optional(),
      parentId: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
      deletedAt: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      deletedById: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      parent: z.lazy(() => CollectionOrderByWithRelationInputSchema).optional(),
      children: z.lazy(() => CollectionOrderByRelationAggregateInputSchema).optional(),
      user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
      products: z.lazy(() => ProductOrderByRelationAggregateInputSchema).optional(),
      brands: z.lazy(() => BrandOrderByRelationAggregateInputSchema).optional(),
      taxonomies: z.lazy(() => TaxonomyOrderByRelationAggregateInputSchema).optional(),
      categories: z.lazy(() => ProductCategoryOrderByRelationAggregateInputSchema).optional(),
      pdpJoins: z.lazy(() => PdpJoinOrderByRelationAggregateInputSchema).optional(),
      media: z.lazy(() => MediaOrderByRelationAggregateInputSchema).optional(),
      favorites: z.lazy(() => FavoriteJoinOrderByRelationAggregateInputSchema).optional(),
      registries: z.lazy(() => RegistryItemOrderByRelationAggregateInputSchema).optional(),
      identifiers: z.lazy(() => ProductIdentifiersOrderByRelationAggregateInputSchema).optional(),
      deletedBy: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
    })
    .strict();

export default CollectionOrderByWithRelationInputSchema;
