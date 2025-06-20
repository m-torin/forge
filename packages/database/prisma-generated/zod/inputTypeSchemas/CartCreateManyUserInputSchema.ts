import type { Prisma } from '../../client';

import { z } from 'zod';
import { CartStatusSchema } from './CartStatusSchema';
import { NullableJsonNullValueInputSchema } from './NullableJsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';

export const CartCreateManyUserInputSchema: z.ZodType<Prisma.CartCreateManyUserInput> = z.object({
  id: z.string().cuid().optional(),
  sessionId: z.string().optional().nullable(),
  status: z.lazy(() => CartStatusSchema).optional(),
  expiresAt: z.coerce.date().optional().nullable(),
  currency: z.string().optional(),
  notes: z.string().optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  abandonedAt: z.coerce.date().optional().nullable(),
  recoveredAt: z.coerce.date().optional().nullable(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable()
}).strict();

export default CartCreateManyUserInputSchema;
