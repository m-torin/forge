import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { ProductCategoryOrderByRelationAggregateInputSchema } from './ProductCategoryOrderByRelationAggregateInputSchema';
import { ProductOrderByRelationAggregateInputSchema } from './ProductOrderByRelationAggregateInputSchema';
import { CollectionOrderByRelationAggregateInputSchema } from './CollectionOrderByRelationAggregateInputSchema';
import { MediaOrderByRelationAggregateInputSchema } from './MediaOrderByRelationAggregateInputSchema';
import { UserOrderByWithRelationInputSchema } from './UserOrderByWithRelationInputSchema';

export const ProductCategoryOrderByWithRelationInputSchema: z.ZodType<Prisma.ProductCategoryOrderByWithRelationInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      name: z.lazy(() => SortOrderSchema).optional(),
      slug: z.lazy(() => SortOrderSchema).optional(),
      status: z.lazy(() => SortOrderSchema).optional(),
      copy: z.lazy(() => SortOrderSchema).optional(),
      parentId: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      displayOrder: z.lazy(() => SortOrderSchema).optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
      deletedAt: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      deletedById: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      parent: z.lazy(() => ProductCategoryOrderByWithRelationInputSchema).optional(),
      children: z.lazy(() => ProductCategoryOrderByRelationAggregateInputSchema).optional(),
      products: z.lazy(() => ProductOrderByRelationAggregateInputSchema).optional(),
      collections: z.lazy(() => CollectionOrderByRelationAggregateInputSchema).optional(),
      media: z.lazy(() => MediaOrderByRelationAggregateInputSchema).optional(),
      deletedBy: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
    })
    .strict();

export default ProductCategoryOrderByWithRelationInputSchema;
