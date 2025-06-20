import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema'
import { Prisma } from '../../client'
import { OrderItemStatusSchema } from '../inputTypeSchemas/OrderItemStatusSchema'

/////////////////////////////////////////
// ORDER ITEM SCHEMA
/////////////////////////////////////////

export const OrderItemSchema = z.object({
  status: OrderItemStatusSchema,
  id: z.string().cuid(),
  orderId: z.string(),
  productId: z.string().nullable(),
  variantId: z.string().nullable(),
  productName: z.string(),
  variantName: z.string().nullable(),
  sku: z.string().nullable(),
  quantity: z.number().int(),
  price: z.instanceof(Prisma.Decimal, { message: "Field 'price' must be a Decimal. Location: ['Models', 'OrderItem']"}),
  total: z.instanceof(Prisma.Decimal, { message: "Field 'total' must be a Decimal. Location: ['Models', 'OrderItem']"}),
  isGift: z.boolean(),
  giftMessage: z.string().nullable(),
  registryId: z.string().nullable(),
  fulfilledAt: z.coerce.date().nullable(),
  metadata: JsonValueSchema.nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})

export type OrderItem = z.infer<typeof OrderItemSchema>

export default OrderItemSchema;
