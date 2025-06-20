import { z } from 'zod';
import type { Prisma } from '../../client';
import { InventoryTransactionWhereInputSchema } from '../inputTypeSchemas/InventoryTransactionWhereInputSchema'
import { InventoryTransactionOrderByWithRelationInputSchema } from '../inputTypeSchemas/InventoryTransactionOrderByWithRelationInputSchema'
import { InventoryTransactionWhereUniqueInputSchema } from '../inputTypeSchemas/InventoryTransactionWhereUniqueInputSchema'

export const InventoryTransactionAggregateArgsSchema: z.ZodType<Prisma.InventoryTransactionAggregateArgs> = z.object({
  where: InventoryTransactionWhereInputSchema.optional(),
  orderBy: z.union([ InventoryTransactionOrderByWithRelationInputSchema.array(),InventoryTransactionOrderByWithRelationInputSchema ]).optional(),
  cursor: InventoryTransactionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default InventoryTransactionAggregateArgsSchema;
