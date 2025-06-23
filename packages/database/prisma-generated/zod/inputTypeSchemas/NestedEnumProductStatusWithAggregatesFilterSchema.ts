import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductStatusSchema } from './ProductStatusSchema';
import { NestedIntFilterSchema } from './NestedIntFilterSchema';
import { NestedEnumProductStatusFilterSchema } from './NestedEnumProductStatusFilterSchema';

export const NestedEnumProductStatusWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumProductStatusWithAggregatesFilter> =
  z
    .object({
      equals: z.lazy(() => ProductStatusSchema).optional(),
      in: z
        .lazy(() => ProductStatusSchema)
        .array()
        .optional(),
      notIn: z
        .lazy(() => ProductStatusSchema)
        .array()
        .optional(),
      not: z
        .union([
          z.lazy(() => ProductStatusSchema),
          z.lazy(() => NestedEnumProductStatusWithAggregatesFilterSchema),
        ])
        .optional(),
      _count: z.lazy(() => NestedIntFilterSchema).optional(),
      _min: z.lazy(() => NestedEnumProductStatusFilterSchema).optional(),
      _max: z.lazy(() => NestedEnumProductStatusFilterSchema).optional(),
    })
    .strict();

export default NestedEnumProductStatusWithAggregatesFilterSchema;
