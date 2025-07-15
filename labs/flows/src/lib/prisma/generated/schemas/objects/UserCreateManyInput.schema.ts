import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    id: z.string().optional(),
    createdAt: z.coerce.date().optional(),
    email: z.string().optional().nullable(),
    emailVerified: z.coerce.date().optional().nullable(),
    image: z.string().optional().nullable(),
    name: z.string().optional().nullable(),
    updatedAt: z.coerce.date().optional(),
  })
  .strict();

export const UserCreateManyInputObjectSchema = Schema;
