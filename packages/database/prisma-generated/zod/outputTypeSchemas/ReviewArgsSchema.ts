import { z } from 'zod';
import type { Prisma } from '../../client';
import { ReviewSelectSchema } from '../inputTypeSchemas/ReviewSelectSchema';
import { ReviewIncludeSchema } from '../inputTypeSchemas/ReviewIncludeSchema';

export const ReviewArgsSchema: z.ZodType<Prisma.ReviewDefaultArgs> = z
  .object({
    select: z.lazy(() => ReviewSelectSchema).optional(),
    include: z.lazy(() => ReviewIncludeSchema).optional(),
  })
  .strict();

export default ReviewArgsSchema;
