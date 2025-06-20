import { Prisma } from '../../client';
import Decimal from 'decimal.js';
import { z } from 'zod';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { OrderItemStatusSchema } from './OrderItemStatusSchema';
import { NullableJsonNullValueInputSchema } from './NullableJsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';

export const OrderItemCreateManyVariantInputSchema: z.ZodType<Prisma.OrderItemCreateManyVariantInput> = z.object({
  id: z.string().cuid().optional(),
  orderId: z.string(),
  productId: z.string().optional().nullable(),
  productName: z.string(),
  variantName: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  quantity: z.number().int(),
  price: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  total: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  isGift: z.boolean().optional(),
  giftMessage: z.string().optional().nullable(),
  registryId: z.string().optional().nullable(),
  status: z.lazy(() => OrderItemStatusSchema).optional(),
  fulfilledAt: z.coerce.date().optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional()
}).strict();

export default OrderItemCreateManyVariantInputSchema;
