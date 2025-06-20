import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const RegistryOrderByRelationAggregateInputSchema: z.ZodType<Prisma.RegistryOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default RegistryOrderByRelationAggregateInputSchema;
