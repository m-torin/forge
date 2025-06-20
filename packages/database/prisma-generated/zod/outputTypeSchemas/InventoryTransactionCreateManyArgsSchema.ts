import { z } from 'zod';
import type { Prisma } from '../../client';
import { InventoryTransactionCreateManyInputSchema } from '../inputTypeSchemas/InventoryTransactionCreateManyInputSchema'

export const InventoryTransactionCreateManyArgsSchema: z.ZodType<Prisma.InventoryTransactionCreateManyArgs> = z.object({
  data: z.union([ InventoryTransactionCreateManyInputSchema,InventoryTransactionCreateManyInputSchema.array() ]),
  skipDuplicates: z.boolean().optional(),
}).strict() ;

export default InventoryTransactionCreateManyArgsSchema;
