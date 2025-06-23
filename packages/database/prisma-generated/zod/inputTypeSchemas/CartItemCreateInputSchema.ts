import { Prisma } from '../../client';
import Decimal from 'decimal.js';
import { z } from 'zod';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { NullableJsonNullValueInputSchema } from './NullableJsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { CartCreateNestedOneWithoutItemsInputSchema } from './CartCreateNestedOneWithoutItemsInputSchema';
import { ProductCreateNestedOneWithoutCartItemsInputSchema } from './ProductCreateNestedOneWithoutCartItemsInputSchema';
import { ProductCreateNestedOneWithoutCartItemVariantsInputSchema } from './ProductCreateNestedOneWithoutCartItemVariantsInputSchema';
import { RegistryCreateNestedOneWithoutCartItemsInputSchema } from './RegistryCreateNestedOneWithoutCartItemsInputSchema';

export const CartItemCreateInputSchema: z.ZodType<Prisma.CartItemCreateInput> = z
  .object({
    id: z.string().cuid().optional(),
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
    cart: z.lazy(() => CartCreateNestedOneWithoutItemsInputSchema),
    product: z.lazy(() => ProductCreateNestedOneWithoutCartItemsInputSchema).optional(),
    variant: z.lazy(() => ProductCreateNestedOneWithoutCartItemVariantsInputSchema).optional(),
    registry: z.lazy(() => RegistryCreateNestedOneWithoutCartItemsInputSchema).optional(),
  })
  .strict();

export default CartItemCreateInputSchema;
