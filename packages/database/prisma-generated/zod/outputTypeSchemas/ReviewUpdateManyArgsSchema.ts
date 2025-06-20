import { z } from 'zod';
import type { Prisma } from '../../client';
import { ReviewUpdateManyMutationInputSchema } from '../inputTypeSchemas/ReviewUpdateManyMutationInputSchema'
import { ReviewUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/ReviewUncheckedUpdateManyInputSchema'
import { ReviewWhereInputSchema } from '../inputTypeSchemas/ReviewWhereInputSchema'

export const ReviewUpdateManyArgsSchema: z.ZodType<Prisma.ReviewUpdateManyArgs> = z.object({
  data: z.union([ ReviewUpdateManyMutationInputSchema,ReviewUncheckedUpdateManyInputSchema ]),
  where: ReviewWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default ReviewUpdateManyArgsSchema;
