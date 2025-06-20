import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const BrandSumOrderByAggregateInputSchema: z.ZodType<Prisma.BrandSumOrderByAggregateInput> = z.object({
  displayOrder: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default BrandSumOrderByAggregateInputSchema;
