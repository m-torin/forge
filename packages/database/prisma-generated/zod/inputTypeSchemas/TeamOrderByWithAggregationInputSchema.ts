import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { TeamCountOrderByAggregateInputSchema } from './TeamCountOrderByAggregateInputSchema';
import { TeamMaxOrderByAggregateInputSchema } from './TeamMaxOrderByAggregateInputSchema';
import { TeamMinOrderByAggregateInputSchema } from './TeamMinOrderByAggregateInputSchema';

export const TeamOrderByWithAggregationInputSchema: z.ZodType<Prisma.TeamOrderByWithAggregationInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      name: z.lazy(() => SortOrderSchema).optional(),
      description: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      organizationId: z.lazy(() => SortOrderSchema).optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      _count: z.lazy(() => TeamCountOrderByAggregateInputSchema).optional(),
      _max: z.lazy(() => TeamMaxOrderByAggregateInputSchema).optional(),
      _min: z.lazy(() => TeamMinOrderByAggregateInputSchema).optional(),
    })
    .strict();

export default TeamOrderByWithAggregationInputSchema;
