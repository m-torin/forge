import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const BrandOrderByRelationAggregateInputSchema: z.ZodType<Prisma.BrandOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default BrandOrderByRelationAggregateInputSchema;
