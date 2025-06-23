import { Prisma } from '../../client';
import Decimal from 'decimal.js';
import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { IntFieldUpdateOperationsInputSchema } from './IntFieldUpdateOperationsInputSchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { DecimalFieldUpdateOperationsInputSchema } from './DecimalFieldUpdateOperationsInputSchema';
import { BoolFieldUpdateOperationsInputSchema } from './BoolFieldUpdateOperationsInputSchema';
import { OrderItemStatusSchema } from './OrderItemStatusSchema';
import { EnumOrderItemStatusFieldUpdateOperationsInputSchema } from './EnumOrderItemStatusFieldUpdateOperationsInputSchema';
import { NullableDateTimeFieldUpdateOperationsInputSchema } from './NullableDateTimeFieldUpdateOperationsInputSchema';
import { NullableJsonNullValueInputSchema } from './NullableJsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';

export const OrderItemUncheckedUpdateWithoutVariantInputSchema: z.ZodType<Prisma.OrderItemUncheckedUpdateWithoutVariantInput> =
  z
    .object({
      id: z
        .union([z.string().cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
        .optional(),
      orderId: z
        .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
        .optional(),
      productId: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      productName: z
        .union([z.string(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
        .optional(),
      variantName: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      sku: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      quantity: z
        .union([z.number().int(), z.lazy(() => IntFieldUpdateOperationsInputSchema)])
        .optional(),
      price: z
        .union([
          z
            .union([
              z.number(),
              z.string(),
              z.instanceof(Decimal),
              z.instanceof(Prisma.Decimal),
              DecimalJsLikeSchema,
            ])
            .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
          z.lazy(() => DecimalFieldUpdateOperationsInputSchema),
        ])
        .optional(),
      total: z
        .union([
          z
            .union([
              z.number(),
              z.string(),
              z.instanceof(Decimal),
              z.instanceof(Prisma.Decimal),
              DecimalJsLikeSchema,
            ])
            .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
          z.lazy(() => DecimalFieldUpdateOperationsInputSchema),
        ])
        .optional(),
      isGift: z.union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)]).optional(),
      giftMessage: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      registryId: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      status: z
        .union([
          z.lazy(() => OrderItemStatusSchema),
          z.lazy(() => EnumOrderItemStatusFieldUpdateOperationsInputSchema),
        ])
        .optional(),
      fulfilledAt: z
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
    })
    .strict();

export default OrderItemUncheckedUpdateWithoutVariantInputSchema;
