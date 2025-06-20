import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { PdpUrlCountOrderByAggregateInputSchema } from './PdpUrlCountOrderByAggregateInputSchema';
import { PdpUrlMaxOrderByAggregateInputSchema } from './PdpUrlMaxOrderByAggregateInputSchema';
import { PdpUrlMinOrderByAggregateInputSchema } from './PdpUrlMinOrderByAggregateInputSchema';

export const PdpUrlOrderByWithAggregationInputSchema: z.ZodType<Prisma.PdpUrlOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  url: z.lazy(() => SortOrderSchema).optional(),
  pdpJoinId: z.lazy(() => SortOrderSchema).optional(),
  urlType: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  copy: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => PdpUrlCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => PdpUrlMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => PdpUrlMinOrderByAggregateInputSchema).optional()
}).strict();

export default PdpUrlOrderByWithAggregationInputSchema;
