import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const JrFindReplaceRejectMinOrderByAggregateInputSchema: z.ZodType<Prisma.JrFindReplaceRejectMinOrderByAggregateInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      lookFor: z.lazy(() => SortOrderSchema).optional(),
      replaceWith: z.lazy(() => SortOrderSchema).optional(),
      ruleAction: z.lazy(() => SortOrderSchema).optional(),
      isRegex: z.lazy(() => SortOrderSchema).optional(),
      regexFlags: z.lazy(() => SortOrderSchema).optional(),
      priority: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export default JrFindReplaceRejectMinOrderByAggregateInputSchema;
