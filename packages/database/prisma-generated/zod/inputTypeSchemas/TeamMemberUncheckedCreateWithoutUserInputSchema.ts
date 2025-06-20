import type { Prisma } from '../../client';

import { z } from 'zod';

export const TeamMemberUncheckedCreateWithoutUserInputSchema: z.ZodType<Prisma.TeamMemberUncheckedCreateWithoutUserInput> = z.object({
  id: z.string().cuid().optional(),
  teamId: z.string(),
  role: z.string().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export default TeamMemberUncheckedCreateWithoutUserInputSchema;
