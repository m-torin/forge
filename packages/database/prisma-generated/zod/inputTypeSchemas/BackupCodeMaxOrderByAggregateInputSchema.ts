import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const BackupCodeMaxOrderByAggregateInputSchema: z.ZodType<Prisma.BackupCodeMaxOrderByAggregateInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      code: z.lazy(() => SortOrderSchema).optional(),
      codeHash: z.lazy(() => SortOrderSchema).optional(),
      userId: z.lazy(() => SortOrderSchema).optional(),
      twoFactorId: z.lazy(() => SortOrderSchema).optional(),
      used: z.lazy(() => SortOrderSchema).optional(),
      usedAt: z.lazy(() => SortOrderSchema).optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export default BackupCodeMaxOrderByAggregateInputSchema;
