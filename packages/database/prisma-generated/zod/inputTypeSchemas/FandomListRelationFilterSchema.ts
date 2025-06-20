import type { Prisma } from '../../client';

import { z } from 'zod';
import { FandomWhereInputSchema } from './FandomWhereInputSchema';

export const FandomListRelationFilterSchema: z.ZodType<Prisma.FandomListRelationFilter> = z.object({
  every: z.lazy(() => FandomWhereInputSchema).optional(),
  some: z.lazy(() => FandomWhereInputSchema).optional(),
  none: z.lazy(() => FandomWhereInputSchema).optional()
}).strict();

export default FandomListRelationFilterSchema;
