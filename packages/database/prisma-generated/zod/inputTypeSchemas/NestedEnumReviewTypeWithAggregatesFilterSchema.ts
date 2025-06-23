import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewTypeSchema } from './ReviewTypeSchema';
import { NestedIntFilterSchema } from './NestedIntFilterSchema';
import { NestedEnumReviewTypeFilterSchema } from './NestedEnumReviewTypeFilterSchema';

export const NestedEnumReviewTypeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumReviewTypeWithAggregatesFilter> =
  z
    .object({
      equals: z.lazy(() => ReviewTypeSchema).optional(),
      in: z
        .lazy(() => ReviewTypeSchema)
        .array()
        .optional(),
      notIn: z
        .lazy(() => ReviewTypeSchema)
        .array()
        .optional(),
      not: z
        .union([
          z.lazy(() => ReviewTypeSchema),
          z.lazy(() => NestedEnumReviewTypeWithAggregatesFilterSchema),
        ])
        .optional(),
      _count: z.lazy(() => NestedIntFilterSchema).optional(),
      _min: z.lazy(() => NestedEnumReviewTypeFilterSchema).optional(),
      _max: z.lazy(() => NestedEnumReviewTypeFilterSchema).optional(),
    })
    .strict();

export default NestedEnumReviewTypeWithAggregatesFilterSchema;
