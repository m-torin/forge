import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionWhereInputSchema } from './CollectionWhereInputSchema';

export const CollectionNullableScalarRelationFilterSchema: z.ZodType<Prisma.CollectionNullableScalarRelationFilter> =
  z
    .object({
      is: z
        .lazy(() => CollectionWhereInputSchema)
        .optional()
        .nullable(),
      isNot: z
        .lazy(() => CollectionWhereInputSchema)
        .optional()
        .nullable(),
    })
    .strict();

export default CollectionNullableScalarRelationFilterSchema;
