import { z } from 'zod';
import type { Prisma } from '../../client';
import { OrganizationIncludeSchema } from '../inputTypeSchemas/OrganizationIncludeSchema';
import { OrganizationUpdateInputSchema } from '../inputTypeSchemas/OrganizationUpdateInputSchema';
import { OrganizationUncheckedUpdateInputSchema } from '../inputTypeSchemas/OrganizationUncheckedUpdateInputSchema';
import { OrganizationWhereUniqueInputSchema } from '../inputTypeSchemas/OrganizationWhereUniqueInputSchema';
import { MemberFindManyArgsSchema } from '../outputTypeSchemas/MemberFindManyArgsSchema';
import { TeamFindManyArgsSchema } from '../outputTypeSchemas/TeamFindManyArgsSchema';
import { InvitationFindManyArgsSchema } from '../outputTypeSchemas/InvitationFindManyArgsSchema';
import { OrganizationCountOutputTypeArgsSchema } from '../outputTypeSchemas/OrganizationCountOutputTypeArgsSchema';
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const OrganizationSelectSchema: z.ZodType<Prisma.OrganizationSelect> = z
  .object({
    id: z.boolean().optional(),
    name: z.boolean().optional(),
    slug: z.boolean().optional(),
    logo: z.boolean().optional(),
    description: z.boolean().optional(),
    metadata: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    members: z.union([z.boolean(), z.lazy(() => MemberFindManyArgsSchema)]).optional(),
    teams: z.union([z.boolean(), z.lazy(() => TeamFindManyArgsSchema)]).optional(),
    invitations: z.union([z.boolean(), z.lazy(() => InvitationFindManyArgsSchema)]).optional(),
    _count: z.union([z.boolean(), z.lazy(() => OrganizationCountOutputTypeArgsSchema)]).optional(),
  })
  .strict();

export const OrganizationUpdateArgsSchema: z.ZodType<Prisma.OrganizationUpdateArgs> = z
  .object({
    select: OrganizationSelectSchema.optional(),
    include: z.lazy(() => OrganizationIncludeSchema).optional(),
    data: z.union([OrganizationUpdateInputSchema, OrganizationUncheckedUpdateInputSchema]),
    where: OrganizationWhereUniqueInputSchema,
  })
  .strict();

export default OrganizationUpdateArgsSchema;
