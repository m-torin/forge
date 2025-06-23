import type { Prisma } from '../../client';

import { z } from 'zod';
import { LocationTypeSchema } from './LocationTypeSchema';
import { NestedIntFilterSchema } from './NestedIntFilterSchema';
import { NestedEnumLocationTypeFilterSchema } from './NestedEnumLocationTypeFilterSchema';

export const NestedEnumLocationTypeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumLocationTypeWithAggregatesFilter> =
  z
    .object({
      equals: z.lazy(() => LocationTypeSchema).optional(),
      in: z
        .lazy(() => LocationTypeSchema)
        .array()
        .optional(),
      notIn: z
        .lazy(() => LocationTypeSchema)
        .array()
        .optional(),
      not: z
        .union([
          z.lazy(() => LocationTypeSchema),
          z.lazy(() => NestedEnumLocationTypeWithAggregatesFilterSchema),
        ])
        .optional(),
      _count: z.lazy(() => NestedIntFilterSchema).optional(),
      _min: z.lazy(() => NestedEnumLocationTypeFilterSchema).optional(),
      _max: z.lazy(() => NestedEnumLocationTypeFilterSchema).optional(),
    })
    .strict();

export default NestedEnumLocationTypeWithAggregatesFilterSchema;
