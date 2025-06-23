import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const JrFindReplaceRejectSumOrderByAggregateInputSchema: z.ZodType<Prisma.JrFindReplaceRejectSumOrderByAggregateInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      priority: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export default JrFindReplaceRejectSumOrderByAggregateInputSchema;
