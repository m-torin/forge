import { Prisma } from '../../client';
import Decimal from 'decimal.js';
import { z } from 'zod';
import { StringWithAggregatesFilterSchema } from './StringWithAggregatesFilterSchema';
import { StringNullableWithAggregatesFilterSchema } from './StringNullableWithAggregatesFilterSchema';
import { IntWithAggregatesFilterSchema } from './IntWithAggregatesFilterSchema';
import { DecimalWithAggregatesFilterSchema } from './DecimalWithAggregatesFilterSchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { BoolWithAggregatesFilterSchema } from './BoolWithAggregatesFilterSchema';
import { EnumOrderItemStatusWithAggregatesFilterSchema } from './EnumOrderItemStatusWithAggregatesFilterSchema';
import { OrderItemStatusSchema } from './OrderItemStatusSchema';
import { DateTimeNullableWithAggregatesFilterSchema } from './DateTimeNullableWithAggregatesFilterSchema';
import { JsonNullableWithAggregatesFilterSchema } from './JsonNullableWithAggregatesFilterSchema';
import { DateTimeWithAggregatesFilterSchema } from './DateTimeWithAggregatesFilterSchema';

export const OrderItemScalarWhereWithAggregatesInputSchema: z.ZodType<Prisma.OrderItemScalarWhereWithAggregatesInput> =
  z
    .object({
      AND: z
        .union([
          z.lazy(() => OrderItemScalarWhereWithAggregatesInputSchema),
          z.lazy(() => OrderItemScalarWhereWithAggregatesInputSchema).array(),
        ])
        .optional(),
      OR: z
        .lazy(() => OrderItemScalarWhereWithAggregatesInputSchema)
        .array()
        .optional(),
      NOT: z
        .union([
          z.lazy(() => OrderItemScalarWhereWithAggregatesInputSchema),
          z.lazy(() => OrderItemScalarWhereWithAggregatesInputSchema).array(),
        ])
        .optional(),
      id: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
      orderId: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
      productId: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      variantId: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      productName: z.union([z.lazy(() => StringWithAggregatesFilterSchema), z.string()]).optional(),
      variantName: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      sku: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      quantity: z.union([z.lazy(() => IntWithAggregatesFilterSchema), z.number()]).optional(),
      price: z
        .union([
          z.lazy(() => DecimalWithAggregatesFilterSchema),
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
          z.lazy(() => DecimalWithAggregatesFilterSchema),
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
      isGift: z.union([z.lazy(() => BoolWithAggregatesFilterSchema), z.boolean()]).optional(),
      giftMessage: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      registryId: z
        .union([z.lazy(() => StringNullableWithAggregatesFilterSchema), z.string()])
        .optional()
        .nullable(),
      status: z
        .union([
          z.lazy(() => EnumOrderItemStatusWithAggregatesFilterSchema),
          z.lazy(() => OrderItemStatusSchema),
        ])
        .optional(),
      fulfilledAt: z
        .union([z.lazy(() => DateTimeNullableWithAggregatesFilterSchema), z.coerce.date()])
        .optional()
        .nullable(),
      metadata: z.lazy(() => JsonNullableWithAggregatesFilterSchema).optional(),
      createdAt: z
        .union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()])
        .optional(),
      updatedAt: z
        .union([z.lazy(() => DateTimeWithAggregatesFilterSchema), z.coerce.date()])
        .optional(),
    })
    .strict();

export default OrderItemScalarWhereWithAggregatesInputSchema;
