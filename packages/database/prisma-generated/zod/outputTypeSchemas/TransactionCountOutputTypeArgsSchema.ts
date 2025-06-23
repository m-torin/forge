import { z } from 'zod';
import type { Prisma } from '../../client';
import { TransactionCountOutputTypeSelectSchema } from './TransactionCountOutputTypeSelectSchema';

export const TransactionCountOutputTypeArgsSchema: z.ZodType<Prisma.TransactionCountOutputTypeDefaultArgs> =
  z
    .object({
      select: z.lazy(() => TransactionCountOutputTypeSelectSchema).nullish(),
    })
    .strict();

export default TransactionCountOutputTypeSelectSchema;
