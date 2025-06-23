import { z } from 'zod';
import type { Prisma } from '../../client';
import { RegistryUserJoinIncludeSchema } from '../inputTypeSchemas/RegistryUserJoinIncludeSchema';
import { RegistryUserJoinCreateInputSchema } from '../inputTypeSchemas/RegistryUserJoinCreateInputSchema';
import { RegistryUserJoinUncheckedCreateInputSchema } from '../inputTypeSchemas/RegistryUserJoinUncheckedCreateInputSchema';
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

export const RegistryUserJoinCreateArgsSchema: z.ZodType<Prisma.RegistryUserJoinCreateArgs> = z
  .object({
    select: RegistryUserJoinSelectSchema.optional(),
    include: z.lazy(() => RegistryUserJoinIncludeSchema).optional(),
    data: z.union([RegistryUserJoinCreateInputSchema, RegistryUserJoinUncheckedCreateInputSchema]),
  })
  .strict();

export default RegistryUserJoinCreateArgsSchema;
