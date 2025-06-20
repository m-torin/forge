import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewWhereInputSchema } from './ReviewWhereInputSchema';

export const ReviewNullableScalarRelationFilterSchema: z.ZodType<Prisma.ReviewNullableScalarRelationFilter> = z.object({
  is: z.lazy(() => ReviewWhereInputSchema).optional().nullable(),
  isNot: z.lazy(() => ReviewWhereInputSchema).optional().nullable()
}).strict();

export default ReviewNullableScalarRelationFilterSchema;
