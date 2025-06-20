import { z } from 'zod';
import type { Prisma } from '../../client';
import { MemberFindManyArgsSchema } from "../outputTypeSchemas/MemberFindManyArgsSchema"
import { TeamFindManyArgsSchema } from "../outputTypeSchemas/TeamFindManyArgsSchema"
import { InvitationFindManyArgsSchema } from "../outputTypeSchemas/InvitationFindManyArgsSchema"
import { OrganizationCountOutputTypeArgsSchema } from "../outputTypeSchemas/OrganizationCountOutputTypeArgsSchema"

export const OrganizationIncludeSchema: z.ZodType<Prisma.OrganizationInclude> = z.object({
  members: z.union([z.boolean(),z.lazy(() => MemberFindManyArgsSchema)]).optional(),
  teams: z.union([z.boolean(),z.lazy(() => TeamFindManyArgsSchema)]).optional(),
  invitations: z.union([z.boolean(),z.lazy(() => InvitationFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => OrganizationCountOutputTypeArgsSchema)]).optional(),
}).strict()

export default OrganizationIncludeSchema;
