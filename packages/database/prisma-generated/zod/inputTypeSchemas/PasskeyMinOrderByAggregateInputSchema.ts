import type { Prisma } from '../../client';

import { z } from 'zod';
import { SortOrderSchema } from './SortOrderSchema';

export const PasskeyMinOrderByAggregateInputSchema: z.ZodType<Prisma.PasskeyMinOrderByAggregateInput> =
  z
    .object({
      id: z.lazy(() => SortOrderSchema).optional(),
      name: z.lazy(() => SortOrderSchema).optional(),
      userId: z.lazy(() => SortOrderSchema).optional(),
      credentialId: z.lazy(() => SortOrderSchema).optional(),
      publicKey: z.lazy(() => SortOrderSchema).optional(),
      counter: z.lazy(() => SortOrderSchema).optional(),
      deviceType: z.lazy(() => SortOrderSchema).optional(),
      backedUp: z.lazy(() => SortOrderSchema).optional(),
      createdAt: z.lazy(() => SortOrderSchema).optional(),
      updatedAt: z.lazy(() => SortOrderSchema).optional(),
      lastUsedAt: z.lazy(() => SortOrderSchema).optional(),
    })
    .strict();

export default PasskeyMinOrderByAggregateInputSchema;
