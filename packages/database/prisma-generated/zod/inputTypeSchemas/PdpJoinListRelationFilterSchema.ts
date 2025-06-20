import type { Prisma } from '../../client';

import { z } from 'zod';
import { PdpJoinWhereInputSchema } from './PdpJoinWhereInputSchema';

export const PdpJoinListRelationFilterSchema: z.ZodType<Prisma.PdpJoinListRelationFilter> = z.object({
  every: z.lazy(() => PdpJoinWhereInputSchema).optional(),
  some: z.lazy(() => PdpJoinWhereInputSchema).optional(),
  none: z.lazy(() => PdpJoinWhereInputSchema).optional()
}).strict();

export default PdpJoinListRelationFilterSchema;
