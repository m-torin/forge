import type { Prisma } from '../../client';

import { z } from 'zod';
import { ContentStatusSchema } from './ContentStatusSchema';
import { NestedEnumContentStatusWithAggregatesFilterSchema } from './NestedEnumContentStatusWithAggregatesFilterSchema';
import { NestedIntFilterSchema } from './NestedIntFilterSchema';
import { NestedEnumContentStatusFilterSchema } from './NestedEnumContentStatusFilterSchema';

export const EnumContentStatusWithAggregatesFilterSchema: z.ZodType<Prisma.EnumContentStatusWithAggregatesFilter> =
  z
    .object({
      equals: z.lazy(() => ContentStatusSchema).optional(),
      in: z
        .lazy(() => ContentStatusSchema)
        .array()
        .optional(),
      notIn: z
        .lazy(() => ContentStatusSchema)
        .array()
        .optional(),
      not: z
        .union([
          z.lazy(() => ContentStatusSchema),
          z.lazy(() => NestedEnumContentStatusWithAggregatesFilterSchema),
        ])
        .optional(),
      _count: z.lazy(() => NestedIntFilterSchema).optional(),
      _min: z.lazy(() => NestedEnumContentStatusFilterSchema).optional(),
      _max: z.lazy(() => NestedEnumContentStatusFilterSchema).optional(),
    })
    .strict();

export default EnumContentStatusWithAggregatesFilterSchema;
