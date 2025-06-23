import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const LocationCountOrderByAggregateInputSchema: z.ZodType<Prisma.LocationCountOrderByAggregateInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      name: z.lazy(() => SortOrderSchema).optional(),
      slug: z.lazy(() => SortOrderSchema).optional(),
      locationType: z.lazy(() => SortOrderSchema).optional(),
      lodgingType: z.lazy(() => SortOrderSchema).optional(),
      isFictional: z.lazy(() => SortOrderSchema).optional(),
      copy: z.lazy(() => SortOrderSchema).optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
      deletedAt: z.lazy(() => SortOrderSchema).optional(),
      deletedById: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export default LocationCountOrderByAggregateInputSchema;
