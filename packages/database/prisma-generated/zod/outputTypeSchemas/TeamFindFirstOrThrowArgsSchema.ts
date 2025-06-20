import { z } from 'zod';
import type { Prisma } from '../../client';
import { TeamIncludeSchema } from '../inputTypeSchemas/TeamIncludeSchema'
import { TeamWhereInputSchema } from '../inputTypeSchemas/TeamWhereInputSchema'
import { TeamOrderByWithRelationInputSchema } from '../inputTypeSchemas/TeamOrderByWithRelationInputSchema'
import { TeamWhereUniqueInputSchema } from '../inputTypeSchemas/TeamWhereUniqueInputSchema'
import { TeamScalarFieldEnumSchema } from '../inputTypeSchemas/TeamScalarFieldEnumSchema'
import { OrganizationArgsSchema } from "../outputTypeSchemas/OrganizationArgsSchema"
import { InvitationFindManyArgsSchema } from "../outputTypeSchemas/InvitationFindManyArgsSchema"
import { TeamMemberFindManyArgsSchema } from "../outputTypeSchemas/TeamMemberFindManyArgsSchema"
import { TeamCountOutputTypeArgsSchema } from "../outputTypeSchemas/TeamCountOutputTypeArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const TeamSelectSchema: z.ZodType<Prisma.TeamSelect> = z.object({
  id: z.boolean().optional(),
  name: z.boolean().optional(),
  description: z.boolean().optional(),
  organizationId: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  organization: z.union([z.boolean(),z.lazy(() => OrganizationArgsSchema)]).optional(),
  invitations: z.union([z.boolean(),z.lazy(() => InvitationFindManyArgsSchema)]).optional(),
  teamMembers: z.union([z.boolean(),z.lazy(() => TeamMemberFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => TeamCountOutputTypeArgsSchema)]).optional(),
}).strict()

export const TeamFindFirstOrThrowArgsSchema: z.ZodType<Prisma.TeamFindFirstOrThrowArgs> = z.object({
  select: TeamSelectSchema.optional(),
  include: z.lazy(() => TeamIncludeSchema).optional(),
  where: TeamWhereInputSchema.optional(),
  orderBy: z.union([ TeamOrderByWithRelationInputSchema.array(),TeamOrderByWithRelationInputSchema ]).optional(),
  cursor: TeamWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ TeamScalarFieldEnumSchema,TeamScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export default TeamFindFirstOrThrowArgsSchema;
