import type { Prisma } from '../../client';

import { z } from 'zod';
import { PasskeyCreatetransportsInputSchema } from './PasskeyCreatetransportsInputSchema';

export const PasskeyCreateManyUserInputSchema: z.ZodType<Prisma.PasskeyCreateManyUserInput> = z
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
  })
  .strict();

export default PasskeyCreateManyUserInputSchema;
