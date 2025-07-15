import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<any> = z
  .object({
    access_token: SortOrderSchema.optional(),
    expires_at: SortOrderSchema.optional(),
    id: SortOrderSchema.optional(),
    id_token: SortOrderSchema.optional(),
    oauth_token: SortOrderSchema.optional(),
    oauth_token_secret: SortOrderSchema.optional(),
    provider: SortOrderSchema.optional(),
    providerAccountId: SortOrderSchema.optional(),
    refresh_token: SortOrderSchema.optional(),
    refresh_token_expires_in: SortOrderSchema.optional(),
    scope: SortOrderSchema.optional(),
    session_state: SortOrderSchema.optional(),
    token_type: SortOrderSchema.optional(),
    type: SortOrderSchema.optional(),
    userId: SortOrderSchema.optional(),
  })
  .strict();

export const AccountMaxOrderByAggregateInputObjectSchema = Schema;
