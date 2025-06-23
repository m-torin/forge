import { z } from 'zod';
import type { Prisma } from '../../client';

export const ReviewCountOutputTypeSelectSchema: z.ZodType<Prisma.ReviewCountOutputTypeSelect> = z
  .object({
    media: z.boolean().optional(),
    votes: z.boolean().optional(),
  })
  .strict();

export default ReviewCountOutputTypeSelectSchema;
