import type { Prisma } from '../../client';

import { z } from 'zod';
import { ProductStatusSchema } from './ProductStatusSchema';
import { NestedEnumProductStatusFilterSchema } from './NestedEnumProductStatusFilterSchema';

export const EnumProductStatusFilterSchema: z.ZodType<Prisma.EnumProductStatusFilter> = z.object({
  equals: z.lazy(() => ProductStatusSchema).optional(),
  in: z.lazy(() => ProductStatusSchema).array().optional(),
  notIn: z.lazy(() => ProductStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => ProductStatusSchema),z.lazy(() => NestedEnumProductStatusFilterSchema) ]).optional(),
}).strict();

export default EnumProductStatusFilterSchema;
