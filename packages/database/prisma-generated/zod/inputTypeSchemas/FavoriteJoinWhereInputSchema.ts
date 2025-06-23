import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { UserScalarRelationFilterSchema } from './UserScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { ProductNullableScalarRelationFilterSchema } from './ProductNullableScalarRelationFilterSchema';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';
import { CollectionNullableScalarRelationFilterSchema } from './CollectionNullableScalarRelationFilterSchema';
import { CollectionWhereInputSchema } from './CollectionWhereInputSchema';

export const FavoriteJoinWhereInputSchema: z.ZodType<Prisma.FavoriteJoinWhereInput> = z
  .object({
    AND: z
      .union([
        z.lazy(() => FavoriteJoinWhereInputSchema),
        z.lazy(() => FavoriteJoinWhereInputSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => FavoriteJoinWhereInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => FavoriteJoinWhereInputSchema),
        z.lazy(() => FavoriteJoinWhereInputSchema).array(),
      ])
      .optional(),
    id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    userId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    productId: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    collectionId: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    user: z
      .union([z.lazy(() => UserScalarRelationFilterSchema), z.lazy(() => UserWhereInputSchema)])
      .optional(),
    product: z
      .union([
        z.lazy(() => ProductNullableScalarRelationFilterSchema),
        z.lazy(() => ProductWhereInputSchema),
      ])
      .optional()
      .nullable(),
    collection: z
      .union([
        z.lazy(() => CollectionNullableScalarRelationFilterSchema),
        z.lazy(() => CollectionWhereInputSchema),
      ])
      .optional()
      .nullable(),
  })
  .strict();

export default FavoriteJoinWhereInputSchema;
