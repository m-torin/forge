import { z } from 'zod';
import type { Prisma } from '../../client';
import { UserArgsSchema } from '../outputTypeSchemas/UserArgsSchema';
import { TeamArgsSchema } from '../outputTypeSchemas/TeamArgsSchema';

export const TeamMemberSelectSchema: z.ZodType<Prisma.TeamMemberSelect> = z
  .object({
    id: z.boolean().optional(),
    userId: z.boolean().optional(),
    teamId: z.boolean().optional(),
    role: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    user: z.union([z.boolean(), z.lazy(() => UserArgsSchema)]).optional(),
    team: z.union([z.boolean(), z.lazy(() => TeamArgsSchema)]).optional(),
  })
  .strict();

export default TeamMemberSelectSchema;
