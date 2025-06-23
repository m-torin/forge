import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionTypeSchema } from './CollectionTypeSchema';

export const NestedEnumCollectionTypeFilterSchema: z.ZodType<Prisma.NestedEnumCollectionTypeFilter> =
  z
    .object({
      equals: z.lazy(() => CollectionTypeSchema).optional(),
      in: z
        .lazy(() => CollectionTypeSchema)
        .array()
        .optional(),
      notIn: z
        .lazy(() => CollectionTypeSchema)
        .array()
        .optional(),
      not: z
        .union([
          z.lazy(() => CollectionTypeSchema),
          z.lazy(() => NestedEnumCollectionTypeFilterSchema),
        ])
        .optional(),
    })
    .strict();

export default NestedEnumCollectionTypeFilterSchema;
