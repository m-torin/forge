import type { Prisma } from '../../client';

import { z } from 'zod';
import { UserCreateNestedOneWithoutTeamMembershipsInputSchema } from './UserCreateNestedOneWithoutTeamMembershipsInputSchema';

export const TeamMemberCreateWithoutTeamInputSchema: z.ZodType<Prisma.TeamMemberCreateWithoutTeamInput> = z.object({
  id: z.string().cuid().optional(),
  role: z.string().optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  user: z.lazy(() => UserCreateNestedOneWithoutTeamMembershipsInputSchema)
}).strict();

export default TeamMemberCreateWithoutTeamInputSchema;
