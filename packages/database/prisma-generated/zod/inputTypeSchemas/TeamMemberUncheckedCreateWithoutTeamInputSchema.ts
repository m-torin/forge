import type { Prisma } from '../../client';

import { z } from 'zod';

export const TeamMemberUncheckedCreateWithoutTeamInputSchema: z.ZodType<Prisma.TeamMemberUncheckedCreateWithoutTeamInput> = z.object({
  id: z.string().cuid().optional(),
  userId: z.string(),
  role: z.string().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export default TeamMemberUncheckedCreateWithoutTeamInputSchema;
