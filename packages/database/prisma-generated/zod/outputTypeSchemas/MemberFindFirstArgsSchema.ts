import { z } from 'zod';
import type { Prisma } from '../../client';
import { MemberIncludeSchema } from '../inputTypeSchemas/MemberIncludeSchema';
import { MemberWhereInputSchema } from '../inputTypeSchemas/MemberWhereInputSchema';
import { MemberOrderByWithRelationInputSchema } from '../inputTypeSchemas/MemberOrderByWithRelationInputSchema';
import { MemberWhereUniqueInputSchema } from '../inputTypeSchemas/MemberWhereUniqueInputSchema';
import { MemberScalarFieldEnumSchema } from '../inputTypeSchemas/MemberScalarFieldEnumSchema';
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

export const MemberFindFirstArgsSchema: z.ZodType<Prisma.MemberFindFirstArgs> = z
  .object({
    select: MemberSelectSchema.optional(),
    include: z.lazy(() => MemberIncludeSchema).optional(),
    where: MemberWhereInputSchema.optional(),
    orderBy: z
      .union([MemberOrderByWithRelationInputSchema.array(), MemberOrderByWithRelationInputSchema])
      .optional(),
    cursor: MemberWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z
      .union([MemberScalarFieldEnumSchema, MemberScalarFieldEnumSchema.array()])
      .optional(),
  })
  .strict();

export default MemberFindFirstArgsSchema;
