import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { UserOrderByWithRelationInputSchema } from './UserOrderByWithRelationInputSchema';
import { ArticleOrderByWithRelationInputSchema } from './ArticleOrderByWithRelationInputSchema';
import { BrandOrderByWithRelationInputSchema } from './BrandOrderByWithRelationInputSchema';
import { CollectionOrderByWithRelationInputSchema } from './CollectionOrderByWithRelationInputSchema';
import { ProductOrderByWithRelationInputSchema } from './ProductOrderByWithRelationInputSchema';
import { TaxonomyOrderByWithRelationInputSchema } from './TaxonomyOrderByWithRelationInputSchema';
import { ProductCategoryOrderByWithRelationInputSchema } from './ProductCategoryOrderByWithRelationInputSchema';
import { PdpJoinOrderByWithRelationInputSchema } from './PdpJoinOrderByWithRelationInputSchema';
import { ReviewOrderByWithRelationInputSchema } from './ReviewOrderByWithRelationInputSchema';

export const MediaOrderByWithRelationInputSchema: z.ZodType<Prisma.MediaOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  url: z.lazy(() => SortOrderSchema).optional(),
  altText: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  width: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  height: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  size: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  mimeType: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  sortOrder: z.lazy(() => SortOrderSchema).optional(),
  userId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  copy: z.lazy(() => SortOrderSchema).optional(),
  articleId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  brandId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  collectionId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  productId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  taxonomyId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  categoryId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  pdpJoinId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  deletedById: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  reviewId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  article: z.lazy(() => ArticleOrderByWithRelationInputSchema).optional(),
  brand: z.lazy(() => BrandOrderByWithRelationInputSchema).optional(),
  collection: z.lazy(() => CollectionOrderByWithRelationInputSchema).optional(),
  product: z.lazy(() => ProductOrderByWithRelationInputSchema).optional(),
  taxonomy: z.lazy(() => TaxonomyOrderByWithRelationInputSchema).optional(),
  category: z.lazy(() => ProductCategoryOrderByWithRelationInputSchema).optional(),
  pdpJoin: z.lazy(() => PdpJoinOrderByWithRelationInputSchema).optional(),
  deletedBy: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  review: z.lazy(() => ReviewOrderByWithRelationInputSchema).optional()
}).strict();

export default MediaOrderByWithRelationInputSchema;
