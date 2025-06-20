import type { Prisma } from '../../client';

import { z } from 'zod';
import { CastWhereInputSchema } from './CastWhereInputSchema';

export const CastListRelationFilterSchema: z.ZodType<Prisma.CastListRelationFilter> = z.object({
  every: z.lazy(() => CastWhereInputSchema).optional(),
  some: z.lazy(() => CastWhereInputSchema).optional(),
  none: z.lazy(() => CastWhereInputSchema).optional()
}).strict();

export default CastListRelationFilterSchema;
