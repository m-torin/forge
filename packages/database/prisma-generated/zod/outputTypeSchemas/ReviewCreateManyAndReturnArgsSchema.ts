import { z } from 'zod';
import type { Prisma } from '../../client';
import { ReviewCreateManyInputSchema } from '../inputTypeSchemas/ReviewCreateManyInputSchema'

export const ReviewCreateManyAndReturnArgsSchema: z.ZodType<Prisma.ReviewCreateManyAndReturnArgs> = z.object({
  data: z.union([ ReviewCreateManyInputSchema,ReviewCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default ReviewCreateManyAndReturnArgsSchema;
