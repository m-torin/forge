import { z } from 'zod';
import type { Prisma } from '../../client';
import { TransactionUpdateManyMutationInputSchema } from '../inputTypeSchemas/TransactionUpdateManyMutationInputSchema'
import { TransactionUncheckedUpdateManyInputSchema } from '../inputTypeSchemas/TransactionUncheckedUpdateManyInputSchema'
import { TransactionWhereInputSchema } from '../inputTypeSchemas/TransactionWhereInputSchema'

export const TransactionUpdateManyAndReturnArgsSchema: z.ZodType<Prisma.TransactionUpdateManyAndReturnArgs> = z.object({
  data: z.union([ TransactionUpdateManyMutationInputSchema,TransactionUncheckedUpdateManyInputSchema ]),
  where: TransactionWhereInputSchema.optional(),
  limit: z.number().optional(),
}).strict() ;

export default TransactionUpdateManyAndReturnArgsSchema;
