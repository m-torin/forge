import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductStatusSchema } from './ProductStatusSchema';

export const NestedEnumProductStatusFilterSchema: z.ZodType<Prisma.NestedEnumProductStatusFilter> =
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
          z.lazy(() => NestedEnumProductStatusFilterSchema),
        ])
        .optional(),
    })
    .strict();

export default NestedEnumProductStatusFilterSchema;
