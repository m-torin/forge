import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { RegistryUserJoinCountOrderByAggregateInputSchema } from './RegistryUserJoinCountOrderByAggregateInputSchema';
import { RegistryUserJoinMaxOrderByAggregateInputSchema } from './RegistryUserJoinMaxOrderByAggregateInputSchema';
import { RegistryUserJoinMinOrderByAggregateInputSchema } from './RegistryUserJoinMinOrderByAggregateInputSchema';

export const RegistryUserJoinOrderByWithAggregationInputSchema: z.ZodType<Prisma.RegistryUserJoinOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  role: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  registryId: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => RegistryUserJoinCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => RegistryUserJoinMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => RegistryUserJoinMinOrderByAggregateInputSchema).optional()
}).strict();

export default RegistryUserJoinOrderByWithAggregationInputSchema;
