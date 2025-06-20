import { z } from 'zod';
import type { Prisma } from '../../client';
import { PasskeyIncludeSchema } from '../inputTypeSchemas/PasskeyIncludeSchema'
import { PasskeyWhereUniqueInputSchema } from '../inputTypeSchemas/PasskeyWhereUniqueInputSchema'
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const PasskeySelectSchema: z.ZodType<Prisma.PasskeySelect> = z.object({
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
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
}).strict()

export const PasskeyFindUniqueOrThrowArgsSchema: z.ZodType<Prisma.PasskeyFindUniqueOrThrowArgs> = z.object({
  select: PasskeySelectSchema.optional(),
  include: z.lazy(() => PasskeyIncludeSchema).optional(),
  where: PasskeyWhereUniqueInputSchema,
}).strict() ;

export default PasskeyFindUniqueOrThrowArgsSchema;
