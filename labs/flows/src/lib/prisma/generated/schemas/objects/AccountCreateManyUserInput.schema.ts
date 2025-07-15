import { z } from 'zod';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    access_token: z.string().optional().nullable(),
    expires_at: z.number().int().optional().nullable(),
    id: z.string().optional(),
    id_token: z.string().optional().nullable(),
    oauth_token: z.string().optional().nullable(),
    oauth_token_secret: z.string().optional().nullable(),
    provider: z.string(),
    providerAccountId: z.string(),
    refresh_token: z.string().optional().nullable(),
    refresh_token_expires_in: z.number().int().optional().nullable(),
    scope: z.string().optional().nullable(),
    session_state: z.string().optional().nullable(),
    token_type: z.string().optional().nullable(),
    type: z.string(),
  })
  .strict();

export const AccountCreateManyUserInputObjectSchema = Schema;
