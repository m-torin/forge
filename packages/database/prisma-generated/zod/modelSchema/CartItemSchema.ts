import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema'
import { Prisma } from '../../client'

/////////////////////////////////////////
// CART ITEM SCHEMA
/////////////////////////////////////////

export const CartItemSchema = z.object({
  id: z.string().cuid(),
  cartId: z.string(),
  productId: z.string().nullable(),
  variantId: z.string().nullable(),
  quantity: z.number().int(),
  price: z.instanceof(Prisma.Decimal, { message: "Field 'price' must be a Decimal. Location: ['Models', 'CartItem']"}),
  isGift: z.boolean(),
  giftMessage: z.string().nullable(),
  registryId: z.string().nullable(),
  savedForLater: z.boolean(),
  metadata: JsonValueSchema.nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type CartItem = z.infer<typeof CartItemSchema>

export default CartItemSchema;
