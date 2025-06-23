import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { OrganizationCountOrderByAggregateInputSchema } from './OrganizationCountOrderByAggregateInputSchema';
import { OrganizationMaxOrderByAggregateInputSchema } from './OrganizationMaxOrderByAggregateInputSchema';
import { OrganizationMinOrderByAggregateInputSchema } from './OrganizationMinOrderByAggregateInputSchema';

export const OrganizationOrderByWithAggregationInputSchema: z.ZodType<Prisma.OrganizationOrderByWithAggregationInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      name: z.lazy(() => SortOrderSchema).optional(),
      slug: z.lazy(() => SortOrderSchema).optional(),
      logo: z.union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)]).optional(),
      description: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      metadata: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      _count: z.lazy(() => OrganizationCountOrderByAggregateInputSchema).optional(),
      _max: z.lazy(() => OrganizationMaxOrderByAggregateInputSchema).optional(),
      _min: z.lazy(() => OrganizationMinOrderByAggregateInputSchema).optional(),
    })
    .strict();

export default OrganizationOrderByWithAggregationInputSchema;
