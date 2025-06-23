import type { Prisma } from '../../client';

import { z } from 'zod';
import { CollectionTypeSchema } from './CollectionTypeSchema';
import { NestedEnumCollectionTypeWithAggregatesFilterSchema } from './NestedEnumCollectionTypeWithAggregatesFilterSchema';
import { NestedIntFilterSchema } from './NestedIntFilterSchema';
import { NestedEnumCollectionTypeFilterSchema } from './NestedEnumCollectionTypeFilterSchema';

export const EnumCollectionTypeWithAggregatesFilterSchema: z.ZodType<Prisma.EnumCollectionTypeWithAggregatesFilter> =
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
          z.lazy(() => NestedEnumCollectionTypeWithAggregatesFilterSchema),
        ])
        .optional(),
      _count: z.lazy(() => NestedIntFilterSchema).optional(),
      _min: z.lazy(() => NestedEnumCollectionTypeFilterSchema).optional(),
      _max: z.lazy(() => NestedEnumCollectionTypeFilterSchema).optional(),
    })
    .strict();

export default EnumCollectionTypeWithAggregatesFilterSchema;
