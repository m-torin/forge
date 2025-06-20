import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const PasskeySumOrderByAggregateInputSchema: z.ZodType<Prisma.PasskeySumOrderByAggregateInput> = z.object({
  counter: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default PasskeySumOrderByAggregateInputSchema;
