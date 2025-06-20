import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { RegistryCountOrderByAggregateInputSchema } from './RegistryCountOrderByAggregateInputSchema';
import { RegistryMaxOrderByAggregateInputSchema } from './RegistryMaxOrderByAggregateInputSchema';
import { RegistryMinOrderByAggregateInputSchema } from './RegistryMinOrderByAggregateInputSchema';

export const RegistryOrderByWithAggregationInputSchema: z.ZodType<Prisma.RegistryOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  deletedById: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  title: z.lazy(() => SortOrderSchema).optional(),
  description: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  type: z.lazy(() => SortOrderSchema).optional(),
  isPublic: z.lazy(() => SortOrderSchema).optional(),
  eventDate: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdByUserId: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  _count: z.lazy(() => RegistryCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => RegistryMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => RegistryMinOrderByAggregateInputSchema).optional()
}).strict();

export default RegistryOrderByWithAggregationInputSchema;
