import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const JollyRogerSumOrderByAggregateInputSchema: z.ZodType<Prisma.JollyRogerSumOrderByAggregateInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export default JollyRogerSumOrderByAggregateInputSchema;
