import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewWhereInputSchema } from './ReviewWhereInputSchema';

export const ReviewListRelationFilterSchema: z.ZodType<Prisma.ReviewListRelationFilter> = z
  .object({
    every: z.lazy(() => ReviewWhereInputSchema).optional(),
    some: z.lazy(() => ReviewWhereInputSchema).optional(),
    none: z.lazy(() => ReviewWhereInputSchema).optional(),
  })
  .strict();

export default ReviewListRelationFilterSchema;
