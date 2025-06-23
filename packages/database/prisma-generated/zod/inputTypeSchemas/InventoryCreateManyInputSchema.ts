import type { Prisma } from '../../client';

import { z } from 'zod';
import { NullableJsonNullValueInputSchema } from './NullableJsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';

export const InventoryCreateManyInputSchema: z.ZodType<Prisma.InventoryCreateManyInput> = z
  .object({
    id: z.string().cuid().optional(),
    productId: z.string().optional().nullable(),
    variantId: z.string().optional().nullable(),
    quantity: z.number().int().optional(),
    reserved: z.number().int().optional(),
    available: z.number().int().optional(),
    lowStockThreshold: z.number().int().optional().nullable(),
    locationId: z.string().optional().nullable(),
    locationName: z.string().optional().nullable(),
    lastRestockedAt: z.coerce.date().optional().nullable(),
    metadata: z
      .union([z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema])
      .optional(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
  })
  .strict();

export default InventoryCreateManyInputSchema;
