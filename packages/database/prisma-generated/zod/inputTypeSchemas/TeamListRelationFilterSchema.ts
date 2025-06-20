import type { Prisma } from '../../client';

import { z } from 'zod';
import { TeamWhereInputSchema } from './TeamWhereInputSchema';

export const TeamListRelationFilterSchema: z.ZodType<Prisma.TeamListRelationFilter> = z.object({
  every: z.lazy(() => TeamWhereInputSchema).optional(),
  some: z.lazy(() => TeamWhereInputSchema).optional(),
  none: z.lazy(() => TeamWhereInputSchema).optional()
}).strict();

export default TeamListRelationFilterSchema;
