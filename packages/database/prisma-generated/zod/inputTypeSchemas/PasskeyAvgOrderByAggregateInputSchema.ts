import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const PasskeyAvgOrderByAggregateInputSchema: z.ZodType<Prisma.PasskeyAvgOrderByAggregateInput> = z.object({
  counter: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default PasskeyAvgOrderByAggregateInputSchema;
