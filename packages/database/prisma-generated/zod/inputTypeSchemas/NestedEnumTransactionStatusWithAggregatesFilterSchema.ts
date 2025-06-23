import type { Prisma } from '../../client';

import { z } from 'zod';
import { TransactionStatusSchema } from './TransactionStatusSchema';
import { NestedIntFilterSchema } from './NestedIntFilterSchema';
import { NestedEnumTransactionStatusFilterSchema } from './NestedEnumTransactionStatusFilterSchema';

export const NestedEnumTransactionStatusWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumTransactionStatusWithAggregatesFilter> =
  z
    .object({
      equals: z.lazy(() => TransactionStatusSchema).optional(),
      in: z
        .lazy(() => TransactionStatusSchema)
        .array()
        .optional(),
      notIn: z
        .lazy(() => TransactionStatusSchema)
        .array()
        .optional(),
      not: z
        .union([
          z.lazy(() => TransactionStatusSchema),
          z.lazy(() => NestedEnumTransactionStatusWithAggregatesFilterSchema),
        ])
        .optional(),
      _count: z.lazy(() => NestedIntFilterSchema).optional(),
      _min: z.lazy(() => NestedEnumTransactionStatusFilterSchema).optional(),
      _max: z.lazy(() => NestedEnumTransactionStatusFilterSchema).optional(),
    })
    .strict();

export default NestedEnumTransactionStatusWithAggregatesFilterSchema;
