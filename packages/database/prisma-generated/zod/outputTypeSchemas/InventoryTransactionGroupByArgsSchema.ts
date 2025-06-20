import { z } from 'zod';
import type { Prisma } from '../../client';
import { InventoryTransactionWhereInputSchema } from '../inputTypeSchemas/InventoryTransactionWhereInputSchema'
import { InventoryTransactionOrderByWithAggregationInputSchema } from '../inputTypeSchemas/InventoryTransactionOrderByWithAggregationInputSchema'
import { InventoryTransactionScalarFieldEnumSchema } from '../inputTypeSchemas/InventoryTransactionScalarFieldEnumSchema'
import { InventoryTransactionScalarWhereWithAggregatesInputSchema } from '../inputTypeSchemas/InventoryTransactionScalarWhereWithAggregatesInputSchema'

export const InventoryTransactionGroupByArgsSchema: z.ZodType<Prisma.InventoryTransactionGroupByArgs> = z.object({
  where: InventoryTransactionWhereInputSchema.optional(),
  orderBy: z.union([ InventoryTransactionOrderByWithAggregationInputSchema.array(),InventoryTransactionOrderByWithAggregationInputSchema ]).optional(),
  by: InventoryTransactionScalarFieldEnumSchema.array(),
  having: InventoryTransactionScalarWhereWithAggregatesInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
}).strict() ;

export default InventoryTransactionGroupByArgsSchema;
