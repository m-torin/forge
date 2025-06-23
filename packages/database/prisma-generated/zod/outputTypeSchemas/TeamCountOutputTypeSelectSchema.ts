import { z } from 'zod';
import type { Prisma } from '../../client';

export const TeamCountOutputTypeSelectSchema: z.ZodType<Prisma.TeamCountOutputTypeSelect> = z
  .object({
    invitations: z.boolean().optional(),
    teamMembers: z.boolean().optional(),
  })
  .strict();

export default TeamCountOutputTypeSelectSchema;
