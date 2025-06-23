import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const RegistryItemAvgOrderByAggregateInputSchema: z.ZodType<Prisma.RegistryItemAvgOrderByAggregateInput> =
  z
    .object({
      quantity: z.lazy(() => SortOrderSchema).optional(),
      priority: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export default RegistryItemAvgOrderByAggregateInputSchema;
