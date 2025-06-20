import type { Prisma } from '../../client';

import { z } from 'zod';
import { CartWhereInputSchema } from './CartWhereInputSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { EnumCartStatusFilterSchema } from './EnumCartStatusFilterSchema';
import { CartStatusSchema } from './CartStatusSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { JsonNullableFilterSchema } from './JsonNullableFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { UserNullableScalarRelationFilterSchema } from './UserNullableScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { CartItemListRelationFilterSchema } from './CartItemListRelationFilterSchema';

export const CartWhereUniqueInputSchema: z.ZodType<Prisma.CartWhereUniqueInput> = z.union([
  z.object({
    id: z.string().cuid(),
    userId: z.string()
  }),
  z.object({
    id: z.string().cuid(),
  }),
  z.object({
    userId: z.string(),
  }),
])
.and(z.object({
  id: z.string().cuid().optional(),
  userId: z.string().optional(),
  AND: z.union([ z.lazy(() => CartWhereInputSchema),z.lazy(() => CartWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CartWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CartWhereInputSchema),z.lazy(() => CartWhereInputSchema).array() ]).optional(),
  sessionId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  status: z.union([ z.lazy(() => EnumCartStatusFilterSchema),z.lazy(() => CartStatusSchema) ]).optional(),
  expiresAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  currency: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  notes: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  metadata: z.lazy(() => JsonNullableFilterSchema).optional(),
  abandonedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  recoveredAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  deletedAt: z.union([ z.lazy(() => DateTimeNullableFilterSchema),z.coerce.date() ]).optional().nullable(),
  user: z.union([ z.lazy(() => UserNullableScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional().nullable(),
  items: z.lazy(() => CartItemListRelationFilterSchema).optional()
}).strict());

export default CartWhereUniqueInputSchema;
