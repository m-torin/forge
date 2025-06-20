import { z } from 'zod';
import type { Prisma } from '../../client';
import { OrganizationArgsSchema } from "../outputTypeSchemas/OrganizationArgsSchema"
import { InvitationFindManyArgsSchema } from "../outputTypeSchemas/InvitationFindManyArgsSchema"
import { TeamMemberFindManyArgsSchema } from "../outputTypeSchemas/TeamMemberFindManyArgsSchema"
import { TeamCountOutputTypeArgsSchema } from "../outputTypeSchemas/TeamCountOutputTypeArgsSchema"

export const TeamIncludeSchema: z.ZodType<Prisma.TeamInclude> = z.object({
  organization: z.union([z.boolean(),z.lazy(() => OrganizationArgsSchema)]).optional(),
  invitations: z.union([z.boolean(),z.lazy(() => InvitationFindManyArgsSchema)]).optional(),
  teamMembers: z.union([z.boolean(),z.lazy(() => TeamMemberFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => TeamCountOutputTypeArgsSchema)]).optional(),
}).strict()

export default TeamIncludeSchema;
