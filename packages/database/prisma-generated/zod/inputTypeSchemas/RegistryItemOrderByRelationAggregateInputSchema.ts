import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const RegistryItemOrderByRelationAggregateInputSchema: z.ZodType<Prisma.RegistryItemOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default RegistryItemOrderByRelationAggregateInputSchema;
