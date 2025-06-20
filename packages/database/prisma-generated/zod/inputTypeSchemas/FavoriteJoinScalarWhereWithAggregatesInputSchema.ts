import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { DateTimeWithAggregatesFilterSchema } from './DateTimeWithAggregatesFilterSchema';
import { StringNullableWithAggregatesFilterSchema } from './StringNullableWithAggregatesFilterSchema';

export const FavoriteJoinScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.FavoriteJoinScalarWhereWithAggregatesInput> = z.object({
  AND: z.union([ z.lazy(() => FavoriteJoinScalarWhereWithAggregatesInputSchema),z.lazy(() => FavoriteJoinScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  OR: z.lazy(() => FavoriteJoinScalarWhereWithAggregatesInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => FavoriteJoinScalarWhereWithAggregatesInputSchema),z.lazy(() => FavoriteJoinScalarWhereWithAggregatesInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeWithAggregatesFilterSchema),z.coerce.date() ]).optional(),
  userId: z.union([ z.lazy(() => StringWithAggregatesFilterSchema),z.string() ]).optional(),
  productId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
  collectionId: z.union([ z.lazy(() => StringNullableWithAggregatesFilterSchema),z.string() ]).optional().nullable(),
}).strict();

export default FavoriteJoinScalarWhereWithAggregatesInputSchema;
