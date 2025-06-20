import type { Prisma } from '../../client';

import { z } from 'zod';
import { TransactionTypeSchema } from './TransactionTypeSchema';
import { NestedIntFilterSchema } from './NestedIntFilterSchema';
import { NestedEnumTransactionTypeFilterSchema } from './NestedEnumTransactionTypeFilterSchema';

export const NestedEnumTransactionTypeWithAggregatesFilterSchema: z.ZodType<Prisma.NestedEnumTransactionTypeWithAggregatesFilter> = z.object({
  equals: z.lazy(() => TransactionTypeSchema).optional(),
  in: z.lazy(() => TransactionTypeSchema).array().optional(),
  notIn: z.lazy(() => TransactionTypeSchema).array().optional(),
  not: z.union([ z.lazy(() => TransactionTypeSchema),z.lazy(() => NestedEnumTransactionTypeWithAggregatesFilterSchema) ]).optional(),
  _count: z.lazy(() => NestedIntFilterSchema).optional(),
  _min: z.lazy(() => NestedEnumTransactionTypeFilterSchema).optional(),
  _max: z.lazy(() => NestedEnumTransactionTypeFilterSchema).optional()
}).strict();

export default NestedEnumTransactionTypeWithAggregatesFilterSchema;
