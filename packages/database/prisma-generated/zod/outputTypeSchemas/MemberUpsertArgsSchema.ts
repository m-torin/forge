import { z } from 'zod';
import type { Prisma } from '../../client';
import { MemberIncludeSchema } from '../inputTypeSchemas/MemberIncludeSchema';
import { MemberWhereUniqueInputSchema } from '../inputTypeSchemas/MemberWhereUniqueInputSchema';
import { MemberCreateInputSchema } from '../inputTypeSchemas/MemberCreateInputSchema';
import { MemberUncheckedCreateInputSchema } from '../inputTypeSchemas/MemberUncheckedCreateInputSchema';
import { MemberUpdateInputSchema } from '../inputTypeSchemas/MemberUpdateInputSchema';
import { MemberUncheckedUpdateInputSchema } from '../inputTypeSchemas/MemberUncheckedUpdateInputSchema';
import { UserArgsSchema } from '../outputTypeSchemas/UserArgsSchema';
import { OrganizationArgsSchema } from '../outputTypeSchemas/OrganizationArgsSchema';
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const MemberSelectSchema: z.ZodType<Prisma.MemberSelect> = z
  .object({
    id: z.boolean().optional(),
    userId: z.boolean().optional(),
    organizationId: z.boolean().optional(),
    role: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    user: z.union([z.boolean(), z.lazy(() => UserArgsSchema)]).optional(),
    organization: z.union([z.boolean(), z.lazy(() => OrganizationArgsSchema)]).optional(),
  })
  .strict();

export const MemberUpsertArgsSchema: z.ZodType<Prisma.MemberUpsertArgs> = z
  .object({
    select: MemberSelectSchema.optional(),
    include: z.lazy(() => MemberIncludeSchema).optional(),
    where: MemberWhereUniqueInputSchema,
    create: z.union([MemberCreateInputSchema, MemberUncheckedCreateInputSchema]),
    update: z.union([MemberUpdateInputSchema, MemberUncheckedUpdateInputSchema]),
  })
  .strict();

export default MemberUpsertArgsSchema;
