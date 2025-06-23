import { Prisma } from '../../client';
import Decimal from 'decimal.js';
import { z } from 'zod';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { NullableJsonNullValueInputSchema } from './NullableJsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';

export const CartItemUncheckedCreateWithoutRegistryInputSchema: z.ZodType<Prisma.CartItemUncheckedCreateWithoutRegistryInput> =
  z
    .object({
      id: z.string().cuid().optional(),
      cartId: z.string(),
      productId: z.string().optional().nullable(),
      variantId: z.string().optional().nullable(),
      quantity: z.number().int(),
      price: z
        .union([
          z.number(),
          z.string(),
          z.instanceof(Decimal),
          z.instanceof(Prisma.Decimal),
          DecimalJsLikeSchema,
        ])
        .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
      isGift: z.boolean().optional(),
      giftMessage: z.string().optional().nullable(),
      savedForLater: z.boolean().optional(),
      metadata: z
        .union([z.lazy(() => NullableJsonNullValueInputSchema), InputJsonValueSchema])
        .optional(),
      createdAt: z.coerce.date().optional(),
      updatedAt: z.coerce.date().optional(),
    })
    .strict();

export default CartItemUncheckedCreateWithoutRegistryInputSchema;
