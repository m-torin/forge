import type { Prisma } from '../../client';

import { z } from 'zod';

export const TeamMemberUncheckedCreateInputSchema: z.ZodType<Prisma.TeamMemberUncheckedCreateInput> =
  z
    .object({
      id: z.string().cuid().optional(),
      userId: z.string(),
      teamId: z.string(),
      role: z.string().optional(),
      createdAt: z.coerce.date().optional(),
      updatedAt: z.coerce.date().optional(),
    })
    .strict();

export default TeamMemberUncheckedCreateInputSchema;
