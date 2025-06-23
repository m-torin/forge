import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';

export const FavoriteJoinScalarWhereInputSchema: z.ZodType<Prisma.FavoriteJoinScalarWhereInput> = z
  .object({
    AND: z
      .union([
        z.lazy(() => FavoriteJoinScalarWhereInputSchema),
        z.lazy(() => FavoriteJoinScalarWhereInputSchema).array(),
      ])
      .optional(),
    OR: z
      .lazy(() => FavoriteJoinScalarWhereInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([
        z.lazy(() => FavoriteJoinScalarWhereInputSchema),
        z.lazy(() => FavoriteJoinScalarWhereInputSchema).array(),
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
  })
  .strict();

export default FavoriteJoinScalarWhereInputSchema;
