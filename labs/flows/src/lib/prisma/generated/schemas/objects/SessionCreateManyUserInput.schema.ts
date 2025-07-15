import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    createdAt: z.coerce.date().optional(),
    expires: z.coerce.date(),
    id: z.string().optional(),
    sessionToken: z.string(),
  })
  .strict();

export const SessionCreateManyUserInputObjectSchema = Schema;
