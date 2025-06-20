import { z } from 'zod';
import { JsonValueSchema } from '../inputTypeSchemas/JsonValueSchema'
import { Prisma } from '../../client'
import { OrderStatusSchema } from '../inputTypeSchemas/OrderStatusSchema'
import { PaymentStatusSchema } from '../inputTypeSchemas/PaymentStatusSchema'

/////////////////////////////////////////
// ORDER SCHEMA
/////////////////////////////////////////

export const OrderSchema = z.object({
  status: OrderStatusSchema,
  paymentStatus: PaymentStatusSchema,
  id: z.string().cuid(),
  orderNumber: z.string(),
  userId: z.string().nullable(),
  guestEmail: z.string().nullable(),
  guestName: z.string().nullable(),
  shippingAddressId: z.string().nullable(),
  billingAddressId: z.string().nullable(),
  currency: z.string(),
  subtotal: z.instanceof(Prisma.Decimal, { message: "Field 'subtotal' must be a Decimal. Location: ['Models', 'Order']"}),
  taxAmount: z.instanceof(Prisma.Decimal, { message: "Field 'taxAmount' must be a Decimal. Location: ['Models', 'Order']"}),
  shippingAmount: z.instanceof(Prisma.Decimal, { message: "Field 'shippingAmount' must be a Decimal. Location: ['Models', 'Order']"}),
  discountAmount: z.instanceof(Prisma.Decimal, { message: "Field 'discountAmount' must be a Decimal. Location: ['Models', 'Order']"}),
  total: z.instanceof(Prisma.Decimal, { message: "Field 'total' must be a Decimal. Location: ['Models', 'Order']"}),
  shippingMethod: z.string().nullable(),
  trackingNumber: z.string().nullable(),
  shippedAt: z.coerce.date().nullable(),
  deliveredAt: z.coerce.date().nullable(),
  paymentMethod: z.string().nullable(),
  customerNotes: z.string().nullable(),
  internalNotes: z.string().nullable(),
  metadata: JsonValueSchema.nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
})

export type Order = z.infer<typeof OrderSchema>

export default OrderSchema;
