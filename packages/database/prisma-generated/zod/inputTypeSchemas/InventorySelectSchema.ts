import { z } from 'zod';
import type { Prisma } from '../../client';
import { ProductArgsSchema } from "../outputTypeSchemas/ProductArgsSchema"
import { InventoryTransactionFindManyArgsSchema } from "../outputTypeSchemas/InventoryTransactionFindManyArgsSchema"
import { InventoryCountOutputTypeArgsSchema } from "../outputTypeSchemas/InventoryCountOutputTypeArgsSchema"

export const InventorySelectSchema: z.ZodType<Prisma.InventorySelect> = z.object({
  id: z.boolean().optional(),
  productId: z.boolean().optional(),
  variantId: z.boolean().optional(),
  quantity: z.boolean().optional(),
  reserved: z.boolean().optional(),
  available: z.boolean().optional(),
  lowStockThreshold: z.boolean().optional(),
  locationId: z.boolean().optional(),
  locationName: z.boolean().optional(),
  lastRestockedAt: z.boolean().optional(),
  metadata: z.boolean().optional(),
  createdAt: z.boolean().optional(),
  updatedAt: z.boolean().optional(),
  product: z.union([z.boolean(),z.lazy(() => ProductArgsSchema)]).optional(),
  variant: z.union([z.boolean(),z.lazy(() => ProductArgsSchema)]).optional(),
  transactions: z.union([z.boolean(),z.lazy(() => InventoryTransactionFindManyArgsSchema)]).optional(),
  _count: z.union([z.boolean(),z.lazy(() => InventoryCountOutputTypeArgsSchema)]).optional(),
}).strict()

export default InventorySelectSchema;
