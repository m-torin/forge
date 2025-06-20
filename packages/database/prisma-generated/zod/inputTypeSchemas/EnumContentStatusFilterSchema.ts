import type { Prisma } from '../../client';

import { z } from 'zod';
import { ContentStatusSchema } from './ContentStatusSchema';
import { NestedEnumContentStatusFilterSchema } from './NestedEnumContentStatusFilterSchema';

export const EnumContentStatusFilterSchema: z.ZodType<Prisma.EnumContentStatusFilter> = z.object({
  equals: z.lazy(() => ContentStatusSchema).optional(),
  in: z.lazy(() => ContentStatusSchema).array().optional(),
  notIn: z.lazy(() => ContentStatusSchema).array().optional(),
  not: z.union([ z.lazy(() => ContentStatusSchema),z.lazy(() => NestedEnumContentStatusFilterSchema) ]).optional(),
}).strict();

export default EnumContentStatusFilterSchema;
