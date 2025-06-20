import { Prisma } from '../../client';
import Decimal from 'decimal.js';
import { z } from 'zod';
import { OrderStatusSchema } from './OrderStatusSchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { PaymentStatusSchema } from './PaymentStatusSchema';
import { NullableJsonNullValueInputSchema } from './NullableJsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { OrderItemUncheckedCreateNestedManyWithoutOrderInputSchema } from './OrderItemUncheckedCreateNestedManyWithoutOrderInputSchema';
import { TransactionUncheckedCreateNestedManyWithoutOrderInputSchema } from './TransactionUncheckedCreateNestedManyWithoutOrderInputSchema';

export const OrderUncheckedCreateWithoutBillingAddressInputSchema: z.ZodType<Prisma.OrderUncheckedCreateWithoutBillingAddressInput> = z.object({
  id: z.string().cuid().optional(),
  orderNumber: z.string(),
  userId: z.string().optional().nullable(),
  guestEmail: z.string().optional().nullable(),
  guestName: z.string().optional().nullable(),
  status: z.lazy(() => OrderStatusSchema).optional(),
  shippingAddressId: z.string().optional().nullable(),
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
  items: z.lazy(() => OrderItemUncheckedCreateNestedManyWithoutOrderInputSchema).optional(),
  transactions: z.lazy(() => TransactionUncheckedCreateNestedManyWithoutOrderInputSchema).optional()
}).strict();

export default OrderUncheckedCreateWithoutBillingAddressInputSchema;
