import { z } from 'zod';

export const InventoryScalarFieldEnumSchema = z.enum(['id','productId','variantId','quantity','reserved','available','lowStockThreshold','locationId','locationName','lastRestockedAt','metadata','createdAt','updatedAt']);

export default InventoryScalarFieldEnumSchema;
