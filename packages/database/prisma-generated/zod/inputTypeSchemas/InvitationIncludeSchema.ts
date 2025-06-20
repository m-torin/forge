import { z } from 'zod';
import type { Prisma } from '../../client';
import { OrganizationArgsSchema } from "../outputTypeSchemas/OrganizationArgsSchema"
import { TeamArgsSchema } from "../outputTypeSchemas/TeamArgsSchema"
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"

export const InvitationIncludeSchema: z.ZodType<Prisma.InvitationInclude> = z.object({
  organization: z.union([z.boolean(),z.lazy(() => OrganizationArgsSchema)]).optional(),
  team: z.union([z.boolean(),z.lazy(() => TeamArgsSchema)]).optional(),
  invitedBy: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export default InvitationIncludeSchema;
