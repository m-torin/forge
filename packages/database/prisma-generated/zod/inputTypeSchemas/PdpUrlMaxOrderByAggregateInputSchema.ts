import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const PdpUrlMaxOrderByAggregateInputSchema: z.ZodType<Prisma.PdpUrlMaxOrderByAggregateInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      name: z.lazy(() => SortOrderSchema).optional(),
      url: z.lazy(() => SortOrderSchema).optional(),
      pdpJoinId: z.lazy(() => SortOrderSchema).optional(),
      urlType: z.lazy(() => SortOrderSchema).optional(),
      isActive: z.lazy(() => SortOrderSchema).optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export default PdpUrlMaxOrderByAggregateInputSchema;
