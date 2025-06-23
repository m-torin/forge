import type { Prisma } from '../../client';

import { z } from 'zod';
import { CartStatusSchema } from './CartStatusSchema';
import { NestedIntFilterSchema } from './NestedIntFilterSchema';
import { NestedEnumCartStatusFilterSchema } from './NestedEnumCartStatusFilterSchema';

export const NestedEnumCartStatusWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumCartStatusWithAggregatesFilter> =
  z
    .object({
      equals: z.lazy(() => CartStatusSchema).optional(),
      in: z
        .lazy(() => CartStatusSchema)
        .array()
        .optional(),
      notIn: z
        .lazy(() => CartStatusSchema)
        .array()
        .optional(),
      not: z
        .union([
          z.lazy(() => CartStatusSchema),
          z.lazy(() => NestedEnumCartStatusWithAggregatesFilterSchema),
        ])
        .optional(),
      _count: z.lazy(() => NestedIntFilterSchema).optional(),
      _min: z.lazy(() => NestedEnumCartStatusFilterSchema).optional(),
      _max: z.lazy(() => NestedEnumCartStatusFilterSchema).optional(),
    })
    .strict();

export default NestedEnumCartStatusWithAggregatesFilterSchema;
