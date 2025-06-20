import type { Prisma } from '../../client';

import { z } from 'zod';
import { TeamMemberWhereInputSchema } from './TeamMemberWhereInputSchema';

export const TeamMemberListRelationFilterSchema: z.ZodType<Prisma.TeamMemberListRelationFilter> = z.object({
  every: z.lazy(() => TeamMemberWhereInputSchema).optional(),
  some: z.lazy(() => TeamMemberWhereInputSchema).optional(),
  none: z.lazy(() => TeamMemberWhereInputSchema).optional()
}).strict();

export default TeamMemberListRelationFilterSchema;
