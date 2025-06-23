import { Prisma } from '../../client';
import Decimal from 'decimal.js';
import { z } from 'zod';
import { OrderItemWhereInputSchema } from './OrderItemWhereInputSchema';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { DecimalFilterSchema } from './DecimalFilterSchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { EnumOrderItemStatusFilterSchema } from './EnumOrderItemStatusFilterSchema';
import { OrderItemStatusSchema } from './OrderItemStatusSchema';
import { DateTimeNullableFilterSchema } from './DateTimeNullableFilterSchema';
import { JsonNullableFilterSchema } from './JsonNullableFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { OrderScalarRelationFilterSchema } from './OrderScalarRelationFilterSchema';
import { OrderWhereInputSchema } from './OrderWhereInputSchema';
import { ProductNullableScalarRelationFilterSchema } from './ProductNullableScalarRelationFilterSchema';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';
import { RegistryNullableScalarRelationFilterSchema } from './RegistryNullableScalarRelationFilterSchema';
import { RegistryWhereInputSchema } from './RegistryWhereInputSchema';

export const OrderItemWhereUniqueInputSchema: z.ZodType<Prisma.OrderItemWhereUniqueInput> = z
  .object({
    id: z.string().cuid(),
  })
  .and(
    z
      .object({
        id: z.string().cuid().optional(),
        AND: z
          .union([
            z.lazy(() => OrderItemWhereInputSchema),
            z.lazy(() => OrderItemWhereInputSchema).array(),
          ])
          .optional(),
        OR: z
          .lazy(() => OrderItemWhereInputSchema)
          .array()
          .optional(),
        NOT: z
          .union([
            z.lazy(() => OrderItemWhereInputSchema),
            z.lazy(() => OrderItemWhereInputSchema).array(),
          ])
          .optional(),
        orderId: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
        productId: z
          .union([z.lazy(() => StringNullableFilterSchema), z.string()])
          .optional()
          .nullable(),
        variantId: z
          .union([z.lazy(() => StringNullableFilterSchema), z.string()])
          .optional()
          .nullable(),
        productName: z.union([z.lazy(() => StringFilterSchema), z.string()]).optional(),
        variantName: z
          .union([z.lazy(() => StringNullableFilterSchema), z.string()])
          .optional()
          .nullable(),
        sku: z
          .union([z.lazy(() => StringNullableFilterSchema), z.string()])
          .optional()
          .nullable(),
        quantity: z.union([z.lazy(() => IntFilterSchema), z.number().int()]).optional(),
        price: z
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
        isGift: z.union([z.lazy(() => BoolFilterSchema), z.boolean()]).optional(),
        giftMessage: z
          .union([z.lazy(() => StringNullableFilterSchema), z.string()])
          .optional()
          .nullable(),
        registryId: z
          .union([z.lazy(() => StringNullableFilterSchema), z.string()])
          .optional()
          .nullable(),
        status: z
          .union([
            z.lazy(() => EnumOrderItemStatusFilterSchema),
            z.lazy(() => OrderItemStatusSchema),
          ])
          .optional(),
        fulfilledAt: z
          .union([z.lazy(() => DateTimeNullableFilterSchema), z.coerce.date()])
          .optional()
          .nullable(),
        metadata: z.lazy(() => JsonNullableFilterSchema).optional(),
        createdAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
        updatedAt: z.union([z.lazy(() => DateTimeFilterSchema), z.coerce.date()]).optional(),
        order: z
          .union([
            z.lazy(() => OrderScalarRelationFilterSchema),
            z.lazy(() => OrderWhereInputSchema),
          ])
          .optional(),
        product: z
          .union([
            z.lazy(() => ProductNullableScalarRelationFilterSchema),
            z.lazy(() => ProductWhereInputSchema),
          ])
          .optional()
          .nullable(),
        variant: z
          .union([
            z.lazy(() => ProductNullableScalarRelationFilterSchema),
            z.lazy(() => ProductWhereInputSchema),
          ])
          .optional()
          .nullable(),
        registry: z
          .union([
            z.lazy(() => RegistryNullableScalarRelationFilterSchema),
            z.lazy(() => RegistryWhereInputSchema),
          ])
          .optional()
          .nullable(),
      })
      .strict(),
  );

export default OrderItemWhereUniqueInputSchema;
