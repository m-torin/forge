import { z } from 'zod';
import type { Prisma } from '../../client';
import { UserArgsSchema } from '../outputTypeSchemas/UserArgsSchema';

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

export default PasskeySelectSchema;
