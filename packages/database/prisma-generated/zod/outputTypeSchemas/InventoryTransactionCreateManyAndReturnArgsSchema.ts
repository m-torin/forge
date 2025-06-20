import { z } from 'zod';
import type { Prisma } from '../../client';
import { InventoryTransactionCreateManyInputSchema } from '../inputTypeSchemas/InventoryTransactionCreateManyInputSchema'

export const InventoryTransactionCreateManyAndReturnArgsSchema: z.ZodType<Prisma.InventoryTransactionCreateManyAndReturnArgs> = z.object({
  data: z.union([ InventoryTransactionCreateManyInputSchema,InventoryTransactionCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default InventoryTransactionCreateManyAndReturnArgsSchema;
