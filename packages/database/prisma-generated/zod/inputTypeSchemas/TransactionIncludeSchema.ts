import { z } from 'zod';
import type { Prisma } from '../../client';
import { OrderArgsSchema } from '../outputTypeSchemas/OrderArgsSchema';
import { TransactionArgsSchema } from '../outputTypeSchemas/TransactionArgsSchema';
import { TransactionFindManyArgsSchema } from '../outputTypeSchemas/TransactionFindManyArgsSchema';
import { TransactionCountOutputTypeArgsSchema } from '../outputTypeSchemas/TransactionCountOutputTypeArgsSchema';

export const TransactionIncludeSchema: z.ZodType<Prisma.TransactionInclude> = z
  .object({
    order: z.union([z.boolean(), z.lazy(() => OrderArgsSchema)]).optional(),
    parentTransaction: z.union([z.boolean(), z.lazy(() => TransactionArgsSchema)]).optional(),
    refunds: z.union([z.boolean(), z.lazy(() => TransactionFindManyArgsSchema)]).optional(),
    _count: z.union([z.boolean(), z.lazy(() => TransactionCountOutputTypeArgsSchema)]).optional(),
  })
  .strict();

export default TransactionIncludeSchema;
