import type { Prisma } from '../../client';

import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { IntFieldUpdateOperationsInputSchema } from './IntFieldUpdateOperationsInputSchema';
import { NullableIntFieldUpdateOperationsInputSchema } from './NullableIntFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { NullableDateTimeFieldUpdateOperationsInputSchema } from './NullableDateTimeFieldUpdateOperationsInputSchema';
import { NullableJsonNullValueInputSchema } from './NullableJsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { ProductUpdateOneWithoutInventoryNestedInputSchema } from './ProductUpdateOneWithoutInventoryNestedInputSchema';
import { ProductUpdateOneWithoutInventoryVariantsNestedInputSchema } from './ProductUpdateOneWithoutInventoryVariantsNestedInputSchema';
import { InventoryTransactionUpdateManyWithoutInventoryNestedInputSchema } from './InventoryTransactionUpdateManyWithoutInventoryNestedInputSchema';

export const InventoryUpdateInputSchema: z.ZodType<Prisma.InventoryUpdateInput> = z
  .object({
    id: z
      .union([z.string().cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
      .optional(),
    quantity: z
      .union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)])
      .optional(),
    reserved: z
      .union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)])
      .optional(),
    available: z
      .union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)])
      .optional(),
    lowStockThreshold: z
      .union([z.number().int(), z.lazy(() => NullableIntFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    locationId: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    locationName: z
      .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    lastRestockedAt: z
      .union([z.coerce.date(), z.lazy(() => NullableDateTimeFieldUpdateOperationsInputSchema)])
      .optional()
      .nullable(),
    metadata: z
      .union([z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema])
      .optional(),
    createdAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    updatedAt: z
      .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
      .optional(),
    product: z.lazy(() => ProductUpdateOneWithoutInventoryNestedInputSchema).optional(),
    variant: z.lazy(() => ProductUpdateOneWithoutInventoryVariantsNestedInputSchema).optional(),
    transactions: z
      .lazy(() => InventoryTransactionUpdateManyWithoutInventoryNestedInputSchema)
      .optional(),
  })
  .strict();

export default InventoryUpdateInputSchema;
