import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { SeriesOrderByWithRelationInputSchema } from './SeriesOrderByWithRelationInputSchema';
import { FandomOrderByWithRelationInputSchema } from './FandomOrderByWithRelationInputSchema';
import { ProductOrderByRelationAggregateInputSchema } from './ProductOrderByRelationAggregateInputSchema';
import { JrFindReplaceRejectOrderByRelationAggregateInputSchema } from './JrFindReplaceRejectOrderByRelationAggregateInputSchema';
import { UserOrderByWithRelationInputSchema } from './UserOrderByWithRelationInputSchema';

export const StoryOrderByWithRelationInputSchema: z.ZodType<Prisma.StoryOrderByWithRelationInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      name: z.lazy(() => SortOrderSchema).optional(),
      slug: z.lazy(() => SortOrderSchema).optional(),
      seriesId: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      fandomId: z.lazy(() => SortOrderSchema).optional(),
      displayOrder: z.lazy(() => SortOrderSchema).optional(),
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
      series: z.lazy(() => SeriesOrderByWithRelationInputSchema).optional(),
      fandom: z.lazy(() => FandomOrderByWithRelationInputSchema).optional(),
      products: z.lazy(() => ProductOrderByRelationAggregateInputSchema).optional(),
      jrFindReplaceRejects: z
        .lazy(() => JrFindReplaceRejectOrderByRelationAggregateInputSchema)
        .optional(),
      deletedBy: z.lazy(() => UserOrderByWithRelationInputSchema).optional(),
    })
    .strict();

export default StoryOrderByWithRelationInputSchema;
