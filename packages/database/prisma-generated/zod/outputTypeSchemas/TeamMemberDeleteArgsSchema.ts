import { z } from 'zod';
import type { Prisma } from '../../client';
import { TeamMemberIncludeSchema } from '../inputTypeSchemas/TeamMemberIncludeSchema'
import { TeamMemberWhereUniqueInputSchema } from '../inputTypeSchemas/TeamMemberWhereUniqueInputSchema'
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

export const TeamMemberDeleteArgsSchema: z.ZodType<Prisma.TeamMemberDeleteArgs> = z.object({
  select: TeamMemberSelectSchema.optional(),
  include: z.lazy(() => TeamMemberIncludeSchema).optional(),
  where: TeamMemberWhereUniqueInputSchema,
}).strict() ;

export default TeamMemberDeleteArgsSchema;
