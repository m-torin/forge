import { z } from 'zod';
import type { Prisma } from '../../client';
import { UserArgsSchema } from "../outputTypeSchemas/UserArgsSchema"
import { ProductArgsSchema } from "../outputTypeSchemas/ProductArgsSchema"
import { MediaFindManyArgsSchema } from "../outputTypeSchemas/MediaFindManyArgsSchema"
import { ReviewVoteJoinFindManyArgsSchema } from "../outputTypeSchemas/ReviewVoteJoinFindManyArgsSchema"
import { ReviewCountOutputTypeArgsSchema } from "../outputTypeSchemas/ReviewCountOutputTypeArgsSchema"

export const ReviewIncludeSchema: z.ZodType<Prisma.ReviewInclude> = z.object({
  deletedBy: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  user: z.union([z.boolean(),z.lazy(() => UserArgsSchema)]).optional(),
  product: z.union([z.boolean(),z.lazy(() => ProductArgsSchema)]).optional(),
  media: z.union([z.boolean(),z.lazy(() => MediaFindManyArgsSchema)]).optional(),
  votes: z.union([z.boolean(),z.lazy(() => ReviewVoteJoinFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => ReviewCountOutputTypeArgsSchema)]).optional(),
}).strict()

export default ReviewIncludeSchema;
