import { z } from 'zod';
import type { Prisma } from '../../client';
import { PasskeyIncludeSchema } from '../inputTypeSchemas/PasskeyIncludeSchema';
import { PasskeyWhereInputSchema } from '../inputTypeSchemas/PasskeyWhereInputSchema';
import { PasskeyOrderByWithRelationInputSchema } from '../inputTypeSchemas/PasskeyOrderByWithRelationInputSchema';
import { PasskeyWhereUniqueInputSchema } from '../inputTypeSchemas/PasskeyWhereUniqueInputSchema';
import { PasskeyScalarFieldEnumSchema } from '../inputTypeSchemas/PasskeyScalarFieldEnumSchema';
import { UserArgsSchema } from '../outputTypeSchemas/UserArgsSchema';
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const PasskeySelectSchema: z.ZodType<Prisma.PasskeySelect> = z
  .object({
    id: z.boolean().optional(),
    name: z.boolean().optional(),
    userId: z.boolean().optional(),
    credentialId: z.boolean().optional(),
    publicKey: z.boolean().optional(),
    counter: z.boolean().optional(),
    deviceType: z.boolean().optional(),
    backedUp: z.boolean().optional(),
    transports: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    lastUsedAt: z.boolean().optional(),
    user: z.union([z.boolean(), z.lazy(() => UserArgsSchema)]).optional(),
  })
  .strict();

export const PasskeyFindManyArgsSchema: z.ZodType<Prisma.PasskeyFindManyArgs> = z
  .object({
    select: PasskeySelectSchema.optional(),
    include: z.lazy(() => PasskeyIncludeSchema).optional(),
    where: PasskeyWhereInputSchema.optional(),
    orderBy: z
      .union([PasskeyOrderByWithRelationInputSchema.array(), PasskeyOrderByWithRelationInputSchema])
      .optional(),
    cursor: PasskeyWhereUniqueInputSchema.optional(),
    take: z.number().optional(),
    skip: z.number().optional(),
    distinct: z
      .union([PasskeyScalarFieldEnumSchema, PasskeyScalarFieldEnumSchema.array()])
      .optional(),
  })
  .strict();

export default PasskeyFindManyArgsSchema;
