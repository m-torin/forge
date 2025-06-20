import { z } from 'zod';
import type { Prisma } from '../../client';
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { ReviewArgsSchema } from "../outputTypeSchemas/ReviewArgsSchema"

export const ReviewVoteJoinIncludeSchema: z.ZodType<Prisma.ReviewVoteJoinInclude> = z.object({
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  review: z.union([z.boolean(),z.lazy(() => ReviewArgsSchema)]).optional(),
}).strict()

export default ReviewVoteJoinIncludeSchema;
