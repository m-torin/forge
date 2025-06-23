import type { Prisma } from '../../client';

import { z } from 'zod';
import { ReviewWhereInputSchema } from './ReviewWhereInputSchema';

export const ReviewScalarRelationFilterSchema: z.ZodType<Prisma.ReviewScalarRelationFilter> = z
  .object({
    is: z.lazy(() => ReviewWhereInputSchema).optional(),
    isNot: z.lazy(() => ReviewWhereInputSchema).optional(),
  })
  .strict();

export default ReviewScalarRelationFilterSchema;
