import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const JollyRogerAvgOrderByAggregateInputSchema: z.ZodType<Prisma.JollyRogerAvgOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default JollyRogerAvgOrderByAggregateInputSchema;
