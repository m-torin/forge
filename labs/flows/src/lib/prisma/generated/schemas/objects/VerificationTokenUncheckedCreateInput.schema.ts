import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.VerificationTokenUncheckedCreateInput> = z
  .object({
    createdAt: z.coerce.date().optional(),
    expires: z.coerce.date(),
    identifier: z.string(),
    token: z.string(),
  })
  .strict();

export const VerificationTokenUncheckedCreateInputObjectSchema = Schema;
