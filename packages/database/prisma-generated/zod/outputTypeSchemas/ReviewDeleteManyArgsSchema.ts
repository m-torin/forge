import { z } from 'zod';
import type { Prisma } from '../../client';
import { ReviewWhereInputSchema } from '../inputTypeSchemas/ReviewWhereInputSchema';

export const ReviewDeleteManyArgsSchema: z.ZodType<Prisma.ReviewDeleteManyArgs> = z
  .object({
    where: ReviewWhereInputSchema.optional(),
    limit: z.number().optional(),
  })
  .strict();

export default ReviewDeleteManyArgsSchema;
