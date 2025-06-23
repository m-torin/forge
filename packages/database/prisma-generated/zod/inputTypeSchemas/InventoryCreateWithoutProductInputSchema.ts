import type { Prisma } from '../../client';

import { z } from 'zod';
import { NullableJsonNullValueInputSchema } from './NullableJsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { ProductCreateNestedOneWithoutInventoryVariantsInputSchema } from './ProductCreateNestedOneWithoutInventoryVariantsInputSchema';
import { InventoryTransactionCreateNestedManyWithoutInventoryInputSchema } from './InventoryTransactionCreateNestedManyWithoutInventoryInputSchema';

export const InventoryCreateWithoutProductInputSchema: z.ZodType<Prisma.InventoryCreateWithoutProductInput> =
  z
    .object({
      id: z.string().cuid().optional(),
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
      variant: z.lazy(() => ProductCreateNestedOneWithoutInventoryVariantsInputSchema).optional(),
      transactions: z
        .lazy(() => InventoryTransactionCreateNestedManyWithoutInventoryInputSchema)
        .optional(),
    })
    .strict();

export default InventoryCreateWithoutProductInputSchema;
