import { z } from 'zod';
import type { Prisma } from '../../client';
import { TransactionWhereInputSchema } from '../inputTypeSchemas/TransactionWhereInputSchema'

export const TransactionDeleteManyArgsSchema: z.ZodType<Prisma.TransactionDeleteManyArgs> = z.object({
  where: TransactionWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default TransactionDeleteManyArgsSchema;
