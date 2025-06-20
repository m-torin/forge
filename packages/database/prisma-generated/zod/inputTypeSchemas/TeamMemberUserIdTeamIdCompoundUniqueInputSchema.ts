import type { Prisma } from '../../client';

import { z } from 'zod';

export const TeamMemberUserIdTeamIdCompoundUniqueInputSchema: z.ZodType<Prisma.TeamMemberUserIdTeamIdCompoundUniqueInput> = z.object({
  userId: z.string(),
  teamId: z.string()
}).strict();

export default TeamMemberUserIdTeamIdCompoundUniqueInputSchema;
