import { z } from 'zod';
import type { Prisma } from '../../client';
import { InventoryTransactionIncludeSchema } from '../inputTypeSchemas/InventoryTransactionIncludeSchema'
import { InventoryTransactionWhereInputSchema } from '../inputTypeSchemas/InventoryTransactionWhereInputSchema'
import { InventoryTransactionOrderByWithRelationInputSchema } from '../inputTypeSchemas/InventoryTransactionOrderByWithRelationInputSchema'
import { InventoryTransactionWhereUniqueInputSchema } from '../inputTypeSchemas/InventoryTransactionWhereUniqueInputSchema'
import { InventoryTransactionScalarFieldEnumSchema } from '../inputTypeSchemas/InventoryTransactionScalarFieldEnumSchema'
import { InventoryArgsSchema } from "../outputTypeSchemas/InventoryArgsSchema"
// Select schema needs to be in file to prevent circular imports
//------------------------------------------------------

export const InventoryTransactionSelectSchema: z.ZodType<Prisma.InventoryTransactionSelect> = z.object({
  id: z.boolean().optional(),
  inventoryId: z.boolean().optional(),
  type: z.boolean().optional(),
  quantity: z.boolean().optional(),
  referenceType: z.boolean().optional(),
  referenceId: z.boolean().optional(),
  notes: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  createdBy: z.boolean().optional(),
  inventory: z.union([z.boolean(),z.lazy(() => InventoryArgsSchema)]).optional(),
}).strict()

export const InventoryTransactionFindFirstOrThrowArgsSchema: z.ZodType<Prisma.InventoryTransactionFindFirstOrThrowArgs> = z.object({
  select: InventoryTransactionSelectSchema.optional(),
  include: z.lazy(() => InventoryTransactionIncludeSchema).optional(),
  where: InventoryTransactionWhereInputSchema.optional(),
  orderBy: z.union([ InventoryTransactionOrderByWithRelationInputSchema.array(),InventoryTransactionOrderByWithRelationInputSchema ]).optional(),
  cursor: InventoryTransactionWhereUniqueInputSchema.optional(),
  take: z.number().optional(),
  skip: z.number().optional(),
  distinct: z.union([ InventoryTransactionScalarFieldEnumSchema,InventoryTransactionScalarFieldEnumSchema.array() ]).optional(),
}).strict() ;

export default InventoryTransactionFindFirstOrThrowArgsSchema;
