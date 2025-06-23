import type { Prisma } from '../../client';

import { z } from 'zod';
import { NullableJsonNullValueInputSchema } from './NullableJsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { InventoryTransactionUncheckedCreateNestedManyWithoutInventoryInputSchema } from './InventoryTransactionUncheckedCreateNestedManyWithoutInventoryInputSchema';

export const InventoryUncheckedCreateWithoutVariantInputSchema: z.ZodType<Prisma.InventoryUncheckedCreateWithoutVariantInput> =
  z
    .object({
      id: z.string().cuid().optional(),
      productId: z.string().optional().nullable(),
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
      transactions: z
        .lazy(() => InventoryTransactionUncheckedCreateNestedManyWithoutInventoryInputSchema)
        .optional(),
    })
    .strict();

export default InventoryUncheckedCreateWithoutVariantInputSchema;
