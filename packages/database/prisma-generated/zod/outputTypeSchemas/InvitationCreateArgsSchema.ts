import { z } from 'zod';
import type { Prisma } from '../../client';
import { InvitationIncludeSchema } from '../inputTypeSchemas/InvitationIncludeSchema'
import { InvitationCreateInputSchema } from '../inputTypeSchemas/InvitationCreateInputSchema'
import { InvitationUncheckedCreateInputSchema } from '../inputTypeSchemas/InvitationUncheckedCreateInputSchema'
import { OrganizationArgsSchema } from "../outputTypeSchemas/OrganizationArgsSchema"
import { TeamArgsSchema } from "../outputTypeSchemas/TeamArgsSchema"
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const InvitationSelectSchema: z.ZodType<Prisma.InvitationSelect> = z.object({
  id: z.boolean().optional(),
  email: z.boolean().optional(),
  invitedById: z.boolean().optional(),
  organizationId: z.boolean().optional(),
  role: z.boolean().optional(),
  teamId: z.boolean().optional(),
  status: z.boolean().optional(),
  expiresAt: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  organization: z.union([z.boolean(),z.lazy(() => OrganizationArgsSchema)]).optional(),
  team: z.union([z.boolean(),z.lazy(() => TeamArgsSchema)]).optional(),
  invitedBy: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const InvitationCreateArgsSchema: z.ZodType<Prisma.InvitationCreateArgs> = z.object({
  select: InvitationSelectSchema.optional(),
  include: z.lazy(() => InvitationIncludeSchema).optional(),
  data: z.union([ InvitationCreateInputSchema,InvitationUncheckedCreateInputSchema ]),
}).strict() ;

export default InvitationCreateArgsSchema;
