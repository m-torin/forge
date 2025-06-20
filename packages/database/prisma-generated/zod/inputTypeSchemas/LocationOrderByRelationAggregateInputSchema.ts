import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const LocationOrderByRelationAggregateInputSchema: z.ZodType<Prisma.LocationOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default LocationOrderByRelationAggregateInputSchema;
