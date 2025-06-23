import { z } from 'zod';
import type { Prisma } from '../../client';
import { ReviewCountOutputTypeSelectSchema } from './ReviewCountOutputTypeSelectSchema';

export const ReviewCountOutputTypeArgsSchema: z.ZodType<Prisma.ReviewCountOutputTypeDefaultArgs> = z
  .object({
    select: z.lazy(() => ReviewCountOutputTypeSelectSchema).nullish(),
  })
  .strict();

export default ReviewCountOutputTypeSelectSchema;
