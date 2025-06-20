import { z } from 'zod';
import type { Prisma } from '../../client';
import { InventoryTransactionIncludeSchema } from '../inputTypeSchemas/InventoryTransactionIncludeSchema'
import { InventoryTransactionUpdateInputSchema } from '../inputTypeSchemas/InventoryTransactionUpdateInputSchema'
import { InventoryTransactionUncheckedUpdateInputSchema } from '../inputTypeSchemas/InventoryTransactionUncheckedUpdateInputSchema'
import { InventoryTransactionWhereUniqueInputSchema } from '../inputTypeSchemas/InventoryTransactionWhereUniqueInputSchema'
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

export const InventoryTransactionUpdateArgsSchema: z.ZodType<Prisma.InventoryTransactionUpdateArgs> = z.object({
  select: InventoryTransactionSelectSchema.optional(),
  include: z.lazy(() => InventoryTransactionIncludeSchema).optional(),
  data: z.union([ InventoryTransactionUpdateInputSchema,InventoryTransactionUncheckedUpdateInputSchema ]),
  where: InventoryTransactionWhereUniqueInputSchema,
}).strict() ;

export default InventoryTransactionUpdateArgsSchema;
