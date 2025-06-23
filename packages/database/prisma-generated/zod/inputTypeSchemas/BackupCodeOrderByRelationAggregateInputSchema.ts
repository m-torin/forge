import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const BackupCodeOrderByRelationAggregateInputSchema: z.ZodType<Prisma.BackupCodeOrderByRelationAggregateInput> =
  z
    .object({
      _count: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export default BackupCodeOrderByRelationAggregateInputSchema;
