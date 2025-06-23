import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';
import { SortOrderInputSchema } from './SortOrderInputSchema';
import { TwoFactorOrderByWithRelationInputSchema } from './TwoFactorOrderByWithRelationInputSchema';

export const BackupCodeOrderByWithRelationInputSchema: z.ZodType<Prisma.BackupCodeOrderByWithRelationInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      code: z.lazy(() => SortOrderSchema).optional(),
      codeHash: z.lazy(() => SortOrderSchema).optional(),
      userId: z.lazy(() => SortOrderSchema).optional(),
      twoFactorId: z.lazy(() => SortOrderSchema).optional(),
      used: z.lazy(() => SortOrderSchema).optional(),
      usedAt: z
        .union([z.lazy(() => SortOrderSchema), z.lazy(() => SortOrderInputSchema)])
        .optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      twoFactor: z.lazy(() => TwoFactorOrderByWithRelationInputSchema).optional(),
    })
    .strict();

export default BackupCodeOrderByWithRelationInputSchema;
