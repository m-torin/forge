import { z } from 'zod';
import { SortOrderSchema } from '../enums/SortOrder.schema';
import { UserOrderByWithRelationInputObjectSchema } from './UserOrderByWithRelationInput.schema';

import type { Prisma } from '@prisma/client';

const Schema: z.ZodType<Prisma.SessionOrderByWithRelationInput> = z
  .object({
    createdAt: SortOrderSchema.optional(),
    expires: SortOrderSchema.optional(),
    id: SortOrderSchema.optional(),
    sessionToken: SortOrderSchema.optional(),
    userId: SortOrderSchema.optional(),
    user: z.lazy(() => UserOrderByWithRelationInputObjectSchema).optional(),
  })
  .strict();

export const SessionOrderByWithRelationInputObjectSchema = Schema;
