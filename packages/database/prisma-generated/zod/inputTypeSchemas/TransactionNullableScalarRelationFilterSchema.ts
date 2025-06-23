import type { Prisma } from '../../client';

import { z } from 'zod';
import { TransactionWhereInputSchema } from './TransactionWhereInputSchema';

export const TransactionNullableScalarRelationFilterSchema: z.ZodType<Prisma.TransactionNullableScalarRelationFilter> =
  z
    .object({
      is: z
        .lazy(() => TransactionWhereInputSchema)
        .optional()
        .nullable(),
      isNot: z
        .lazy(() => TransactionWhereInputSchema)
        .optional()
        .nullable(),
    })
    .strict();

export default TransactionNullableScalarRelationFilterSchema;
