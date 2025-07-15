import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    createdAt: z.boolean().optional(),
    expires: z.boolean().optional(),
    identifier: z.boolean().optional(),
    token: z.boolean().optional(),
  })
  .strict();

export const VerificationTokenSelectObjectSchema = Schema;
