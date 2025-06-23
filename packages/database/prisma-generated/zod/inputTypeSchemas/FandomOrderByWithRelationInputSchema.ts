import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { SeriesOrderByRelationAggregateInputSchema } from './SeriesOrderByRelationAggregateInputSchema';
import { StoryOrderByRelationAggregateInputSchema } from './StoryOrderByRelationAggregateInputSchema';
import { ProductOrderByRelationAggregateInputSchema } from './ProductOrderByRelationAggregateInputSchema';
import { LocationOrderByRelationAggregateInputSchema } from './LocationOrderByRelationAggregateInputSchema';
import { JrFindReplaceRejectOrderByRelationAggregateInputSchema } from './JrFindReplaceRejectOrderByRelationAggregateInputSchema';
import { UserOrderByWithRelationInputSchema } from './UserOrderByWithRelationInputSchema';

export const FandomOrderByWithRelationInputSchema: z.ZodType<Prisma.FandomOrderByWithRelationInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      name: z.lazy(() => SortOrderSchema).optional(),
      slug: z.lazy(() => SortOrderSchema).optional(),
      isFictional: z.lazy(() => SortOrderSchema).optional(),
      copy: z.lazy(() => SortOrderSchema).optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
      deletedAt: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      deletedById: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      series: z.lazy(() => SeriesOrderByRelationAggregateInputSchema).optional(),
      stories: z.lazy(() => StoryOrderByRelationAggregateInputSchema).optional(),
      products: z.lazy(() => ProductOrderByRelationAggregateInputSchema).optional(),
      locations: z.lazy(() => LocationOrderByRelationAggregateInputSchema).optional(),
      jrFindReplaceRejects: z
        .lazy(() => JrFindReplaceRejectOrderByRelationAggregateInputSchema)
        .optional(),
      deletedBy: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
    })
    .strict();

export default FandomOrderByWithRelationInputSchema;
