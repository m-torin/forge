import { Prisma } from '../../client';
import Decimal from 'decimal.js';
import { z } from 'zod';
import { OrderStatusSchema } from './OrderStatusSchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { PaymentStatusSchema } from './PaymentStatusSchema';
import { NullableJsonNullValueInputSchema } from './NullableJsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { UserCreateNestedOneWithoutOrdersInputSchema } from './UserCreateNestedOneWithoutOrdersInputSchema';
import { AddressCreateNestedOneWithoutOrderShippingAddressesInputSchema } from './AddressCreateNestedOneWithoutOrderShippingAddressesInputSchema';
import { AddressCreateNestedOneWithoutOrderBillingAddressesInputSchema } from './AddressCreateNestedOneWithoutOrderBillingAddressesInputSchema';
import { OrderItemCreateNestedManyWithoutOrderInputSchema } from './OrderItemCreateNestedManyWithoutOrderInputSchema';

export const OrderCreateWithoutTransactionsInputSchema: z.ZodType<Prisma.OrderCreateWithoutTransactionsInput> = z.object({
  id: z.string().cuid().optional(),
  orderNumber: z.string(),
  guestEmail: z.string().optional().nullable(),
  guestName: z.string().optional().nullable(),
  status: z.lazy(() => OrderStatusSchema).optional(),
  currency: z.string().optional(),
  subtotal: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  taxAmount: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  shippingAmount: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  discountAmount: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }).optional(),
  total: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  shippingMethod: z.string().optional().nullable(),
  trackingNumber: z.string().optional().nullable(),
  shippedAt: z.coerce.date().optional().nullable(),
  deliveredAt: z.coerce.date().optional().nullable(),
  paymentStatus: z.lazy(() => PaymentStatusSchema).optional(),
  paymentMethod: z.string().optional().nullable(),
  customerNotes: z.string().optional().nullable(),
  internalNotes: z.string().optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  deletedAt: z.coerce.date().optional().nullable(),
  user: z.lazy(() => UserCreateNestedOneWithoutOrdersInputSchema).optional(),
  shippingAddress: z.lazy(() => AddressCreateNestedOneWithoutOrderShippingAddressesInputSchema).optional(),
  billingAddress: z.lazy(() => AddressCreateNestedOneWithoutOrderBillingAddressesInputSchema).optional(),
  items: z.lazy(() => OrderItemCreateNestedManyWithoutOrderInputSchema).optional()
}).strict();

export default OrderCreateWithoutTransactionsInputSchema;
