import type { Prisma } from '../../client';

import { z } from 'zod';
import { CartStatusSchema } from './CartStatusSchema';
import { NestedEnumCartStatusWithAggregatesFilterSchema } from './NestedEnumCartStatusWithAggregatesFilterSchema';
import { NestedIntFilterSchema } from './NestedIntFilterSchema';
import { NestedEnumCartStatusFilterSchema } from './NestedEnumCartStatusFilterSchema';

export const EnumCartStatusWithAggregatesFilterSchema: z.ZodType<Prisma.EnumCartStatusWithAggregatesFilter> =
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

export default EnumCartStatusWithAggregatesFilterSchema;
