import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateNestedOneWithoutTeamMembershipsInputSchema } from './UserCreateNestedOneWithoutTeamMembershipsInputSchema';
import { TeamCreateNestedOneWithoutTeamMembersInputSchema } from './TeamCreateNestedOneWithoutTeamMembersInputSchema';

export const TeamMemberCreateInputSchema: z.ZodType<Prisma.TeamMemberCreateInput> = z.object({
  id: z.string().cuid().optional(),
  role: z.string().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutTeamMembershipsInputSchema),
  team: z.lazy(() => TeamCreateNestedOneWithoutTeamMembersInputSchema)
}).strict();

export default TeamMemberCreateInputSchema;
