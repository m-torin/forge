import { z } from 'zod';
import type { Prisma } from '../../client';
import { RegistryUserJoinIncludeSchema } from '../inputTypeSchemas/RegistryUserJoinIncludeSchema';
import { RegistryUserJoinWhereInputSchema } from '../inputTypeSchemas/RegistryUserJoinWhereInputSchema';
import { RegistryUserJoinOrderByWithRelationInputSchema } from '../inputTypeSchemas/RegistryUserJoinOrderByWithRelationInputSchema';
import { RegistryUserJoinWhereUniqueInputSchema } from '../inputTypeSchemas/RegistryUserJoinWhereUniqueInputSchema';
import { RegistryUserJoinScalarFieldEnumSchema } from '../inputTypeSchemas/RegistryUserJoinScalarFieldEnumSchema';
import { UserArgsSchema } from '../outputTypeSchemas/UserArgsSchema';
import { RegistryArgsSchema } from '../outputTypeSchemas/RegistryArgsSchema';
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const RegistryUserJoinSelectSchema: z.ZodType<Prisma.RegistryUserJoinSelect> = z
  .object({
    id: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    role: z.boolean().optional(),
    userId: z.boolean().optional(),
    registryId: z.boolean().optional(),
    user: z.union([z.boolean(), z.lazy(() => UserArgsSchema)]).optional(),
    registry: z.union([z.boolean(), z.lazy(() => RegistryArgsSchema)]).optional(),
  })
  .strict();

export const RegistryUserJoinFindFirstOrThrowArgsSchema: z.ZodType<Prisma.RegistryUserJoinFindFirstOrThrowArgs> =
  z
    .object({
      select: RegistryUserJoinSelectSchema.optional(),
      include: z.lazy(() => RegistryUserJoinIncludeSchema).optional(),
      where: RegistryUserJoinWhereInputSchema.optional(),
      orderBy: z
        .union([
          RegistryUserJoinOrderByWithRelationInputSchema.array(),
          RegistryUserJoinOrderByWithRelationInputSchema,
        ])
        .optional(),
      cursor: RegistryUserJoinWhereUniqueInputSchema.optional(),
      take: z.number().optional(),
      skip: z.number().optional(),
      distinct: z
        .union([
          RegistryUserJoinScalarFieldEnumSchema,
          RegistryUserJoinScalarFieldEnumSchema.array(),
        ])
        .optional(),
    })
    .strict();

export default RegistryUserJoinFindFirstOrThrowArgsSchema;
