import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema';

/////////////////////////////////////////
// INVENTORY SCHEMA
/////////////////////////////////////////

export const InventorySchema = z.object({
  id: z.string().cuid(),
  productId: z.string().nullable(),
  variantId: z.string().nullable(),
  quantity: z.number().int(),
  reserved: z.number().int(),
  available: z.number().int(),
  lowStockThreshold: z.number().int().nullable(),
  locationId: z.string().nullable(),
  locationName: z.string().nullable(),
  lastRestockedAt: z.coerce.date().nullable(),
  metadata: JsonValueSchema.nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type Inventory = z.infer<typeof InventorySchema>;

export default InventorySchema;
