import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const AddressOrderByRelationAggregateInputSchema: z.ZodType<Prisma.AddressOrderByRelationAggregateInput> =
  z
    .object({
      _count: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export default AddressOrderByRelationAggregateInputSchema;
