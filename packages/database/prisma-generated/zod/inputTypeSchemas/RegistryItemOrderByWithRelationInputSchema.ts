import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { UserOrderByWithRelationInputSchema } from './UserOrderByWithRelationInputSchema';
import { RegistryOrderByWithRelationInputSchema } from './RegistryOrderByWithRelationInputSchema';
import { ProductOrderByWithRelationInputSchema } from './ProductOrderByWithRelationInputSchema';
import { CollectionOrderByWithRelationInputSchema } from './CollectionOrderByWithRelationInputSchema';
import { RegistryPurchaseJoinOrderByRelationAggregateInputSchema } from './RegistryPurchaseJoinOrderByRelationAggregateInputSchema';

export const RegistryItemOrderByWithRelationInputSchema: z.ZodType<Prisma.RegistryItemOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  deletedById: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  quantity: z.lazy(() => SortOrderSchema).optional(),
  priority: z.lazy(() => SortOrderSchema).optional(),
  notes: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  purchased: z.lazy(() => SortOrderSchema).optional(),
  registryId: z.lazy(() => SortOrderSchema).optional(),
  productId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  collectionId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  deletedBy: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
  registry: z.lazy(() => RegistryOrderByWithRelationInputSchema).optional(),
  product: z.lazy(() => ProductOrderByWithRelationInputSchema).optional(),
  collection: z.lazy(() => CollectionOrderByWithRelationInputSchema).optional(),
  purchases: z.lazy(() => RegistryPurchaseJoinOrderByRelationAggregateInputSchema).optional()
}).strict();

export default RegistryItemOrderByWithRelationInputSchema;
