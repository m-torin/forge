import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const JrFindReplaceRejectAvgOrderByAggregateInputSchema: z.ZodType<Prisma.JrFindReplaceRejectAvgOrderByAggregateInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      priority: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export default JrFindReplaceRejectAvgOrderByAggregateInputSchema;
