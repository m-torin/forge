import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { UserOrderByWithRelationInputSchema } from './UserOrderByWithRelationInputSchema';
import { ProductOrderByWithRelationInputSchema } from './ProductOrderByWithRelationInputSchema';
import { MediaOrderByRelationAggregateInputSchema } from './MediaOrderByRelationAggregateInputSchema';
import { ReviewVoteJoinOrderByRelationAggregateInputSchema } from './ReviewVoteJoinOrderByRelationAggregateInputSchema';

export const ReviewOrderByWithRelationInputSchema: z.ZodType<Prisma.ReviewOrderByWithRelationInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
      deletedAt: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      deletedById: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      title: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      content: z.lazy(() => SortOrderSchema).optional(),
      rating: z.lazy(() => SortOrderSchema).optional(),
      status: z.lazy(() => SortOrderSchema).optional(),
      verified: z.lazy(() => SortOrderSchema).optional(),
      type: z.lazy(() => SortOrderSchema).optional(),
      sourceId: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      source: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      helpfulCount: z.lazy(() => SortOrderSchema).optional(),
      totalVotes: z.lazy(() => SortOrderSchema).optional(),
      userId: z.lazy(() => SortOrderSchema).optional(),
      productId: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      deletedBy: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
      user: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
      product: z.lazy(() => ProductOrderByWithRelationInputSchema).optional(),
      media: z.lazy(() => MediaOrderByRelationAggregateInputSchema).optional(),
      votes: z.lazy(() => ReviewVoteJoinOrderByRelationAggregateInputSchema).optional(),
    })
    .strict();

export default ReviewOrderByWithRelationInputSchema;
