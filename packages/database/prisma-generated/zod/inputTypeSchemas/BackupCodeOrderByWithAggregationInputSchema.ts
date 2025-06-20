import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { BackupCodeCountOrderByAggregateInputSchema } from './BackupCodeCountOrderByAggregateInputSchema';
import { BackupCodeMaxOrderByAggregateInputSchema } from './BackupCodeMaxOrderByAggregateInputSchema';
import { BackupCodeMinOrderByAggregateInputSchema } from './BackupCodeMinOrderByAggregateInputSchema';

export const BackupCodeOrderByWithAggregationInputSchema: z.ZodType<Prisma.BackupCodeOrderByWithAggregationInput> = z.object({
  id: z.lazy(() => SortOrderSchema).optional(),
  code: z.lazy(() => SortOrderSchema).optional(),
  codeHash: z.lazy(() => SortOrderSchema).optional(),
  userId: z.lazy(() => SortOrderSchema).optional(),
  twoFactorId: z.lazy(() => SortOrderSchema).optional(),
  used: z.lazy(() => SortOrderSchema).optional(),
  usedAt: z.union([ z.lazy(() => SortOrderSchema),z.lazy(() => SortOrderInputSchema) ]).optional(),
  createdAt: z.lazy(() => SortOrderSchema).optional(),
  _count: z.lazy(() => BackupCodeCountOrderByAggregateInputSchema).optional(),
  _max: z.lazy(() => BackupCodeMaxOrderByAggregateInputSchema).optional(),
  _min: z.lazy(() => BackupCodeMinOrderByAggregateInputSchema).optional()
}).strict();

export default BackupCodeOrderByWithAggregationInputSchema;
