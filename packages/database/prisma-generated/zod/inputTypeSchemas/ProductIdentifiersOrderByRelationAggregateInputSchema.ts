import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const ProductIdentifiersOrderByRelationAggregateInputSchema: z.ZodType<Prisma.ProductIdentifiersOrderByRelationAggregateInput> = z.object({
  _count: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default ProductIdentifiersOrderByRelationAggregateInputSchema;
