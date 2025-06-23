import { Prisma } from '../../client';
import Decimal from 'decimal.js';
import { z } from 'zod';
import { StringFieldUpdateOperationsInputSchema } from './StringFieldUpdateOperationsInputSchema';
import { IntFieldUpdateOperationsInputSchema } from './IntFieldUpdateOperationsInputSchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { DecimalFieldUpdateOperationsInputSchema } from './DecimalFieldUpdateOperationsInputSchema';
import { BoolFieldUpdateOperationsInputSchema } from './BoolFieldUpdateOperationsInputSchema';
import { NullableStringFieldUpdateOperationsInputSchema } from './NullableStringFieldUpdateOperationsInputSchema';
import { NullableJsonNullValueInputSchema } from './NullableJsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { DateTimeFieldUpdateOperationsInputSchema } from './DateTimeFieldUpdateOperationsInputSchema';
import { CartUpdateOneRequiredWithoutItemsNestedInputSchema } from './CartUpdateOneRequiredWithoutItemsNestedInputSchema';
import { ProductUpdateOneWithoutCartItemVariantsNestedInputSchema } from './ProductUpdateOneWithoutCartItemVariantsNestedInputSchema';
import { RegistryUpdateOneWithoutCartItemsNestedInputSchema } from './RegistryUpdateOneWithoutCartItemsNestedInputSchema';

export const CartItemUpdateWithoutProductInputSchema: z.ZodType<Prisma.CartItemUpdateWithoutProductInput> =
  z
    .object({
      id: z
        .union([z.string().cuid(), z.lazy(() => StringFieldUpdateOperationsInputSchema)])
        .optional(),
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
      isGift: z.union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)]).optional(),
      giftMessage: z
        .union([z.string(), z.lazy(() => NullableStringFieldUpdateOperationsInputSchema)])
        .optional()
        .nullable(),
      savedForLater: z
        .union([z.boolean(), z.lazy(() => BoolFieldUpdateOperationsInputSchema)])
        .optional(),
      metadata: z
        .union([z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema])
        .optional(),
      createdAt: z
        .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
        .optional(),
      updatedAt: z
        .union([z.coerce.date(), z.lazy(() => DateTimeFieldUpdateOperationsInputSchema)])
        .optional(),
      cart: z.lazy(() => CartUpdateOneRequiredWithoutItemsNestedInputSchema).optional(),
      variant: z.lazy(() => ProductUpdateOneWithoutCartItemVariantsNestedInputSchema).optional(),
      registry: z.lazy(() => RegistryUpdateOneWithoutCartItemsNestedInputSchema).optional(),
    })
    .strict();

export default CartItemUpdateWithoutProductInputSchema;
