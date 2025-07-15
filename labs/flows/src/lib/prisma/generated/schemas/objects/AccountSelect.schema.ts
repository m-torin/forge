import { z } from 'zod';
import { UserArgsObjectSchema } from './UserArgs.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    access_token: z.boolean().optional(),
    expires_at: z.boolean().optional(),
    id: z.boolean().optional(),
    id_token: z.boolean().optional(),
    oauth_token: z.boolean().optional(),
    oauth_token_secret: z.boolean().optional(),
    provider: z.boolean().optional(),
    providerAccountId: z.boolean().optional(),
    refresh_token: z.boolean().optional(),
    refresh_token_expires_in: z.boolean().optional(),
    scope: z.boolean().optional(),
    session_state: z.boolean().optional(),
    token_type: z.boolean().optional(),
    type: z.boolean().optional(),
    user: z.union([z.boolean(), z.lazy(() => UserArgsObjectSchema)]).optional(),
    userId: z.boolean().optional(),
  })
  .strict();

export const AccountSelectObjectSchema = Schema;
