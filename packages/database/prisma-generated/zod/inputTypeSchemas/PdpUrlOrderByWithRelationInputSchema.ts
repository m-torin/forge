import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { PdpJoinOrderByWithRelationInputSchema } from './PdpJoinOrderByWithRelationInputSchema';

export const PdpUrlOrderByWithRelationInputSchema: z.ZodType<Prisma.PdpUrlOrderByWithRelationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  url: z.lazy(() => SortOrderSchema).optional(),
  pdpJoinId: z.lazy(() => SortOrderSchema).optional(),
  urlType: z.lazy(() => SortOrderSchema).optional(),
  isActive: z.lazy(() => SortOrderSchema).optional(),
  copy: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  pdpJoin: z.lazy(() => PdpJoinOrderByWithRelationInputSchema).optional()
}).strict();

export default PdpUrlOrderByWithRelationInputSchema;
