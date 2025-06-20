import { z } from 'zod';
import type { Prisma } from '../../client';
import { InventoryTransactionIncludeSchema } from '../inputTypeSchemas/InventoryTransactionIncludeSchema'
import { InventoryTransactionCreateInputSchema } from '../inputTypeSchemas/InventoryTransactionCreateInputSchema'
import { InventoryTransactionUncheckedCreateInputSchema } from '../inputTypeSchemas/InventoryTransactionUncheckedCreateInputSchema'
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

export const InventoryTransactionCreateArgsSchema: z.ZodType<Prisma.InventoryTransactionCreateArgs> = z.object({
  select: InventoryTransactionSelectSchema.optional(),
  include: z.lazy(() => InventoryTransactionIncludeSchema).optional(),
  data: z.union([ InventoryTransactionCreateInputSchema,InventoryTransactionUncheckedCreateInputSchema ]),
}).strict() ;

export default InventoryTransactionCreateArgsSchema;
