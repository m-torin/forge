import { z } from 'zod';
import type { Prisma } from '../../client';
import { RegistryUserJoinIncludeSchema } from '../inputTypeSchemas/RegistryUserJoinIncludeSchema'
import { RegistryUserJoinWhereUniqueInputSchema } from '../inputTypeSchemas/RegistryUserJoinWhereUniqueInputSchema'
import { RegistryUserJoinCreateInputSchema } from '../inputTypeSchemas/RegistryUserJoinCreateInputSchema'
import { RegistryUserJoinUncheckedCreateInputSchema } from '../inputTypeSchemas/RegistryUserJoinUncheckedCreateInputSchema'
import { RegistryUserJoinUpdateInputSchema } from '../inputTypeSchemas/RegistryUserJoinUpdateInputSchema'
import { RegistryUserJoinUncheckedUpdateInputSchema } from '../inputTypeSchemas/RegistryUserJoinUncheckedUpdateInputSchema'
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { RegistryArgsSchema } from "../outputTypeSchemas/RegistryArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const RegistryUserJoinSelectSchema: z.ZodType<Prisma.RegistryUserJoinSelect> = z.object({
  id: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  role: z.boolean().optional(),
  userId: z.boolean().optional(),
  registryId: z.boolean().optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  registry: z.union([z.boolean(),z.lazy(() => RegistryArgsSchema)]).optional(),
}).strict()

export const RegistryUserJoinUpsertArgsSchema: z.ZodType<Prisma.RegistryUserJoinUpsertArgs> = z.object({
  select: RegistryUserJoinSelectSchema.optional(),
  include: z.lazy(() => RegistryUserJoinIncludeSchema).optional(),
  where: RegistryUserJoinWhereUniqueInputSchema,
  create: z.union([ RegistryUserJoinCreateInputSchema,RegistryUserJoinUncheckedCreateInputSchema ]),
  update: z.union([ RegistryUserJoinUpdateInputSchema,RegistryUserJoinUncheckedUpdateInputSchema ]),
}).strict() ;

export default RegistryUserJoinUpsertArgsSchema;
