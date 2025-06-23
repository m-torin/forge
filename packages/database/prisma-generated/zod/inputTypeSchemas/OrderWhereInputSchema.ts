import { Prisma } from '../../client';
import Decimal from 'decimal.js';
import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { EnumOrderStatusFilterSchema } from './EnumOrderStatusFilterSchema';
import { OrderStatusSchema } from './OrderStatusSchema';
import { DecimalFilterSchema } from './DecimalFilterSchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { EnumPaymentStatusFilterSchema } from './EnumPaymentStatusFilterSchema';
import { PaymentStatusSchema } from './PaymentStatusSchema';
import { JsonNullableFilterSchema } from './JsonNullableFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { UserNullableScalarRelationFilterSchema } from './UserNullableScalarRelationFilterSchema';
import { UserWhereInputSchema } from './UserWhereInputSchema';
import { AddressNullableScalarRelationFilterSchema } from './AddressNullableScalarRelationFilterSchema';
import { AddressWhereInputSchema } from './AddressWhereInputSchema';
import { OrderItemListRelationFilterSchema } from './OrderItemListRelationFilterSchema';
import { TransactionListRelationFilterSchema } from './TransactionListRelationFilterSchema';

export const OrderWhereInputSchema: z.ZodType<Prisma.OrderWhereInput> = z
  .object({
    AND: z
      .union([z.lazy(() => OrderWhereInputSchema), z.lazy(() => OrderWhereInputSchema).array()])
      .optional(),
    OR: z
      .lazy(() => OrderWhereInputSchema)
      .array()
      .optional(),
    NOT: z
      .union([z.lazy(() => OrderWhereInputSchema), z.lazy(() => OrderWhereInputSchema).array()])
      .optional(),
    id: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    orderNumber: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    userId: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    guestEmail: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    guestName: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    status: z
      .union([z.lazy(() => EnumOrderStatusFilterSchema), z.lazy(() => OrderStatusSchema)])
      .optional(),
    shippingAddressId: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    billingAddressId: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    currency: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
    subtotal: z
      .union([
        z.lazy(() => DecimalFilterSchema),
        z
          .union([
            z.number(),
            z.string(),
            z.instanceof(Decimal),
            z.instanceof(Prisma.Decimal),
            DecimalJsLikeSchema,
          ])
          .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
      ])
      .optional(),
    taxAmount: z
      .union([
        z.lazy(() => DecimalFilterSchema),
        z
          .union([
            z.number(),
            z.string(),
            z.instanceof(Decimal),
            z.instanceof(Prisma.Decimal),
            DecimalJsLikeSchema,
          ])
          .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
      ])
      .optional(),
    shippingAmount: z
      .union([
        z.lazy(() => DecimalFilterSchema),
        z
          .union([
            z.number(),
            z.string(),
            z.instanceof(Decimal),
            z.instanceof(Prisma.Decimal),
            DecimalJsLikeSchema,
          ])
          .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
      ])
      .optional(),
    discountAmount: z
      .union([
        z.lazy(() => DecimalFilterSchema),
        z
          .union([
            z.number(),
            z.string(),
            z.instanceof(Decimal),
            z.instanceof(Prisma.Decimal),
            DecimalJsLikeSchema,
          ])
          .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
      ])
      .optional(),
    total: z
      .union([
        z.lazy(() => DecimalFilterSchema),
        z
          .union([
            z.number(),
            z.string(),
            z.instanceof(Decimal),
            z.instanceof(Prisma.Decimal),
            DecimalJsLikeSchema,
          ])
          .refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
      ])
      .optional(),
    shippingMethod: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    trackingNumber: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    shippedAt: z
      .union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
      .optional()
      .nullable(),
    deliveredAt: z
      .union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
      .optional()
      .nullable(),
    paymentStatus: z
      .union([z.lazy(() => EnumPaymentStatusFilterSchema), z.lazy(() => PaymentStatusSchema)])
      .optional(),
    paymentMethod: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    customerNotes: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    internalNotes: z
      .union([z.lazy(() => StringNullableFilterSchema), z.string()])
      .optional()
      .nullable(),
    metadata: z.lazy(() => JsonNullableFilterSchema).optional(),
    createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
    deletedAt: z
      .union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
      .optional()
      .nullable(),
    user: z
      .union([
        z.lazy(() => UserNullableScalarRelationFilterSchema),
        z.lazy(() => UserWhereInputSchema),
      ])
      .optional()
      .nullable(),
    shippingAddress: z
      .union([
        z.lazy(() => AddressNullableScalarRelationFilterSchema),
        z.lazy(() => AddressWhereInputSchema),
      ])
      .optional()
      .nullable(),
    billingAddress: z
      .union([
        z.lazy(() => AddressNullableScalarRelationFilterSchema),
        z.lazy(() => AddressWhereInputSchema),
      ])
      .optional()
      .nullable(),
    items: z.lazy(() => OrderItemListRelationFilterSchema).optional(),
    transactions: z.lazy(() => TransactionListRelationFilterSchema).optional(),
  })
  .strict();

export default OrderWhereInputSchema;
