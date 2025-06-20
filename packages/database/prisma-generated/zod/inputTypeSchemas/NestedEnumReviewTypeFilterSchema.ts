import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewTypeSchema } from './ReviewTypeSchema';

export const NestedEnumReviewTypeFilterSchema: z.ZodType<Prisma.NestedEnumReviewTypeFilter> = z.object({
  equals: z.lazy(() => ReviewTypeSchema).optional(),
  in: z.lazy(() => ReviewTypeSchema).array().optional(),
  notIn: z.lazy(() => ReviewTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => ReviewTypeSchema),z.lazy(() => NestedEnumReviewTypeFilterSchema) ]).optional(),
}).strict();

export default NestedEnumReviewTypeFilterSchema;
