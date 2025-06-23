import { z } from 'zod';

/////////////////////////////////////////
// REGISTRY ITEM SCHEMA
/////////////////////////////////////////

export const RegistryItemSchema = z.object({
  id: z.string().cuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
  deletedById: z.string().nullable(),
  quantity: z.number().int(),
  priority: z.number().int(),
  notes: z.string().nullable(),
  purchased: z.boolean(),
  registryId: z.string(),
  productId: z.string().nullable(),
  collectionId: z.string().nullable(),
});

export type RegistryItem = z.infer<typeof RegistryItemSchema>;

export default RegistryItemSchema;
