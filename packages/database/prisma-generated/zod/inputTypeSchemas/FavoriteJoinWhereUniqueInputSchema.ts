import type { Prisma } from '../../client';

import { z } from 'zod';
import { FavoriteJoinUserIdProductIdCollectionIdCompoundUniqueInputSchema } from './FavoriteJoinUserIdProductIdCollectionIdCompoundUniqueInputSchema';
import { FavoriteJoinWhereInputSchema } from './FavoriteJoinWhereInputSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { UserScalarRelationFilterSchema } from './UserScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { ProductNullableScalarRelationFilterSchema } from './ProductNullableScalarRelationFilterSchema';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';
import { CollectionNullableScalarRelationFilterSchema } from './CollectionNullableScalarRelationFilterSchema';
import { CollectionWhereInputSchema } from './CollectionWhereInputSchema';

export const FavoriteJoinWhereUniqueInputSchema: z.ZodType<Prisma.FavoriteJoinWhereUniqueInput> = z.union([
  z.object({
    id: z.string().cuid(),
    userId_productId_collectionId: z.lazy(() => FavoriteJoinUserIdProductIdCollectionIdCompoundUniqueInputSchema)
  }),
  z.object({
    id: z.string().cuid(),
  }),
  z.object({
    userId_productId_collectionId: z.lazy(() => FavoriteJoinUserIdProductIdCollectionIdCompoundUniqueInputSchema),
  }),
])
.and(z.object({
  id: z.string().cuid().optional(),
  userId_productId_collectionId: z.lazy(() => FavoriteJoinUserIdProductIdCollectionIdCompoundUniqueInputSchema).optional(),
  AND: z.union([ z.lazy(() => FavoriteJoinWhereInputSchema),z.lazy(() => FavoriteJoinWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => FavoriteJoinWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => FavoriteJoinWhereInputSchema),z.lazy(() => FavoriteJoinWhereInputSchema).array() ]).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  userId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  productId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  collectionId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  user: z.union([ z.lazy(() => UserScalarRelationFilterSchema),z.lazy(() => UserWhereInputSchema) ]).optional(),
  product: z.union([ z.lazy(() => ProductNullableScalarRelationFilterSchema),z.lazy(() => ProductWhereInputSchema) ]).optional().nullable(),
  collection: z.union([ z.lazy(() => CollectionNullableScalarRelationFilterSchema),z.lazy(() => CollectionWhereInputSchema) ]).optional().nullable(),
}).strict());

export default FavoriteJoinWhereUniqueInputSchema;
