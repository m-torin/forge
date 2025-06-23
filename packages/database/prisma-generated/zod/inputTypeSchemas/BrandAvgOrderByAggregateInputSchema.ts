import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const BrandAvgOrderByAggregateInputSchema: z.ZodType<Prisma.BrandAvgOrderByAggregateInput> =
  z
    .object({
      displayOrder: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export default BrandAvgOrderByAggregateInputSchema;
