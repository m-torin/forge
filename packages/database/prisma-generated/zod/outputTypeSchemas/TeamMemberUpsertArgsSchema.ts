import { z } from 'zod';
import type { Prisma } from '../../client';
import { TeamMemberIncludeSchema } from '../inputTypeSchemas/TeamMemberIncludeSchema';
import { TeamMemberWhereUniqueInputSchema } from '../inputTypeSchemas/TeamMemberWhereUniqueInputSchema';
import { TeamMemberCreateInputSchema } from '../inputTypeSchemas/TeamMemberCreateInputSchema';
import { TeamMemberUncheckedCreateInputSchema } from '../inputTypeSchemas/TeamMemberUncheckedCreateInputSchema';
import { TeamMemberUpdateInputSchema } from '../inputTypeSchemas/TeamMemberUpdateInputSchema';
import { TeamMemberUncheckedUpdateInputSchema } from '../inputTypeSchemas/TeamMemberUncheckedUpdateInputSchema';
import { UserArgsSchema } from '../outputTypeSchemas/UserArgsSchema';
import { TeamArgsSchema } from '../outputTypeSchemas/TeamArgsSchema';
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

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

export const TeamMemberUpsertArgsSchema: z.ZodType<Prisma.TeamMemberUpsertArgs> = z
  .object({
    select: TeamMemberSelectSchema.optional(),
    include: z.lazy(() => TeamMemberIncludeSchema).optional(),
    where: TeamMemberWhereUniqueInputSchema,
    create: z.union([TeamMemberCreateInputSchema, TeamMemberUncheckedCreateInputSchema]),
    update: z.union([TeamMemberUpdateInputSchema, TeamMemberUncheckedUpdateInputSchema]),
  })
  .strict();

export default TeamMemberUpsertArgsSchema;
