import type { Prisma } from '../../client';

import { z } from 'zod';
import { PasskeyCreatetransportsInputSchema } from './PasskeyCreatetransportsInputSchema';
import { UserCreateNestedOneWithoutPasskeysInputSchema } from './UserCreateNestedOneWithoutPasskeysInputSchema';

export const PasskeyCreateInputSchema: z.ZodType<Prisma.PasskeyCreateInput> = z
  .object({
    id: z.string(),
    name: z.string().optional().nullable(),
    credentialId: z.string(),
    publicKey: z.string(),
    counter: z.number().int(),
    deviceType: z.string(),
    backedUp: z.boolean(),
    transports: z
      .union([z.lazy(() => PasskeyCreatetransportsInputSchema), z.string().array()])
      .optional(),
    createdAt: z.coerce.date(),
    updatedAt: z.coerce.date(),
    lastUsedAt: z.coerce.date().optional().nullable(),
    user: z.lazy(() => UserCreateNestedOneWithoutPasskeysInputSchema),
  })
  .strict();

export default PasskeyCreateInputSchema;
