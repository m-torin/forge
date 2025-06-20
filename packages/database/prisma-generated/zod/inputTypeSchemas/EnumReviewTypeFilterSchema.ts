import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewTypeSchema } from './ReviewTypeSchema';
import { NestedEnumReviewTypeFilterSchema } from './NestedEnumReviewTypeFilterSchema';

export const EnumReviewTypeFilterSchema: z.ZodType<Prisma.EnumReviewTypeFilter> = z.object({
  equals: z.lazy(() => ReviewTypeSchema).optional(),
  in: z.lazy(() => ReviewTypeSchema).array().optional(),
  notIn: z.lazy(() => ReviewTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => ReviewTypeSchema),z.lazy(() => NestedEnumReviewTypeFilterSchema) ]).optional(),
}).strict();

export default EnumReviewTypeFilterSchema;
