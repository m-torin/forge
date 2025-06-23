import { z } from 'zod';
import type { Prisma } from '../../client';
import { ReviewIncludeSchema } from '../inputTypeSchemas/ReviewIncludeSchema';
import { ReviewWhereUniqueInputSchema } from '../inputTypeSchemas/ReviewWhereUniqueInputSchema';
import { UserArgsSchema } from '../outputTypeSchemas/UserArgsSchema';
import { ProductArgsSchema } from '../outputTypeSchemas/ProductArgsSchema';
import { MediaFindManyArgsSchema } from '../outputTypeSchemas/MediaFindManyArgsSchema';
import { ReviewVoteJoinFindManyArgsSchema } from '../outputTypeSchemas/ReviewVoteJoinFindManyArgsSchema';
import { ReviewCountOutputTypeArgsSchema } from '../outputTypeSchemas/ReviewCountOutputTypeArgsSchema';
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const ReviewSelectSchema: z.ZodType<Prisma.ReviewSelect> = z
  .object({
    id: z.boolean().optional(),
    createdAt: z.boolean().optional(),
    updatedAt: z.boolean().optional(),
    deletedAt: z.boolean().optional(),
    deletedById: z.boolean().optional(),
    title: z.boolean().optional(),
    content: z.boolean().optional(),
    rating: z.boolean().optional(),
    status: z.boolean().optional(),
    verified: z.boolean().optional(),
    type: z.boolean().optional(),
    sourceId: z.boolean().optional(),
    source: z.boolean().optional(),
    helpfulCount: z.boolean().optional(),
    totalVotes: z.boolean().optional(),
    userId: z.boolean().optional(),
    productId: z.boolean().optional(),
    deletedBy: z.union([z.boolean(), z.lazy(() => UserArgsSchema)]).optional(),
    user: z.union([z.boolean(), z.lazy(() => UserArgsSchema)]).optional(),
    product: z.union([z.boolean(), z.lazy(() => ProductArgsSchema)]).optional(),
    media: z.union([z.boolean(), z.lazy(() => MediaFindManyArgsSchema)]).optional(),
    votes: z.union([z.boolean(), z.lazy(() => ReviewVoteJoinFindManyArgsSchema)]).optional(),
    _count: z.union([z.boolean(), z.lazy(() => ReviewCountOutputTypeArgsSchema)]).optional(),
  })
  .strict();

export const ReviewDeleteArgsSchema: z.ZodType<Prisma.ReviewDeleteArgs> = z
  .object({
    select: ReviewSelectSchema.optional(),
    include: z.lazy(() => ReviewIncludeSchema).optional(),
    where: ReviewWhereUniqueInputSchema,
  })
  .strict();

export default ReviewDeleteArgsSchema;
