import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const StoryMinOrderByAggregateInputSchema: z.ZodType<Prisma.StoryMinOrderByAggregateInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  name: z.lazy(() => SortOrderSchema).optional(),
  slug: z.lazy(() => SortOrderSchema).optional(),
  seriesId: z.lazy(() => SortOrderSchema).optional(),
  fandomId: z.lazy(() => SortOrderSchema).optional(),
  displayOrder: z.lazy(() => SortOrderSchema).optional(),
  isFictional: z.lazy(() => SortOrderSchema).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  updatedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedAt: z.lazy(() => SortOrderSchema).optional(),
  deletedById: z.lazy(() => SortOrderSchema).optional()
}).strict();

export default StoryMinOrderByAggregateInputSchema;
