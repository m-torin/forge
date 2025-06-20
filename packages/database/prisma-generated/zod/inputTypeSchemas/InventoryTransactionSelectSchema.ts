import { z } from 'zod';
import type { Prisma } from '../../client';
import { InventoryArgsSchema } from "../outputTypeSchemas/InventoryArgsSchema"

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

export default InventoryTransactionSelectSchema;
