import { z } from 'zod';
import type { Prisma } from '../../client';
import { TeamMemberIncludeSchema } from '../inputTypeSchemas/TeamMemberIncludeSchema'
import { TeamMemberCreateInputSchema } from '../inputTypeSchemas/TeamMemberCreateInputSchema'
import { TeamMemberUncheckedCreateInputSchema } from '../inputTypeSchemas/TeamMemberUncheckedCreateInputSchema'
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { TeamArgsSchema } from "../outputTypeSchemas/TeamArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const TeamMemberSelectSchema: z.ZodType<Prisma.TeamMemberSelect> = z.object({
  id: z.boolean().optional(),
  userId: z.boolean().optional(),
  teamId: z.boolean().optional(),
  role: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  team: z.union([z.boolean(),z.lazy(() => TeamArgsSchema)]).optional(),
}).strict()

export const TeamMemberCreateArgsSchema: z.ZodType<Prisma.TeamMemberCreateArgs> = z.object({
  select: TeamMemberSelectSchema.optional(),
  include: z.lazy(() => TeamMemberIncludeSchema).optional(),
  data: z.union([ TeamMemberCreateInputSchema,TeamMemberUncheckedCreateInputSchema ]),
}).strict() ;

export default TeamMemberCreateArgsSchema;
