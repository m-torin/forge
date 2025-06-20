import { z } from 'zod';
import type { Prisma } from '../../client';
import { PasskeyIncludeSchema } from '../inputTypeSchemas/PasskeyIncludeSchema'
import { PasskeyUpdateInputSchema } from '../inputTypeSchemas/PasskeyUpdateInputSchema'
import { PasskeyUncheckedUpdateInputSchema } from '../inputTypeSchemas/PasskeyUncheckedUpdateInputSchema'
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

export const PasskeyUpdateArgsSchema: z.ZodType<Prisma.PasskeyUpdateArgs> = z.object({
  select: PasskeySelectSchema.optional(),
  include: z.lazy(() => PasskeyIncludeSchema).optional(),
  data: z.union([ PasskeyUpdateInputSchema,PasskeyUncheckedUpdateInputSchema ]),
  where: PasskeyWhereUniqueInputSchema,
}).strict() ;

export default PasskeyUpdateArgsSchema;
