import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductTypeSchema } from './ProductTypeSchema';

export const NestedEnumProductTypeFilterSchema: z.ZodType<Prisma.NestedEnumProductTypeFilter> = z
  .object({
    equals: z.lazy(() => ProductTypeSchema).optional(),
    in: z
      .lazy(() => ProductTypeSchema)
      .array()
      .optional(),
    notIn: z
      .lazy(() => ProductTypeSchema)
      .array()
      .optional(),
    not: z
      .union([z.lazy(() => ProductTypeSchema), z.lazy(() => NestedEnumProductTypeFilterSchema)])
      .optional(),
  })
  .strict();

export default NestedEnumProductTypeFilterSchema;
