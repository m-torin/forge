import { Prisma } from '../../client';
import Decimal from 'decimal.js';
import { z } from 'zod';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { OrderItemStatusSchema } from './OrderItemStatusSchema';
import { NullableJsonNullValueInputSchema } from './NullableJsonNullValueInputSchema';
import { InputJsonValueSchema } from './InputJsonValueSchema';
import { OrderCreateNestedOneWithoutItemsInputSchema } from './OrderCreateNestedOneWithoutItemsInputSchema';
import { ProductCreateNestedOneWithoutOrderItemsInputSchema } from './ProductCreateNestedOneWithoutOrderItemsInputSchema';
import { ProductCreateNestedOneWithoutOrderItemVariantsInputSchema } from './ProductCreateNestedOneWithoutOrderItemVariantsInputSchema';
import { RegistryCreateNestedOneWithoutOrderItemsInputSchema } from './RegistryCreateNestedOneWithoutOrderItemsInputSchema';

export const OrderItemCreateInputSchema: z.ZodType<Prisma.OrderItemCreateInput> = z.object({
  id: z.string().cuid().optional(),
  productName: z.string(),
  variantName: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  quantity: z.number().int(),
  price: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  total: z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }),
  isGift: z.boolean().optional(),
  giftMessage: z.string().optional().nullable(),
  status: z.lazy(() => OrderItemStatusSchema).optional(),
  fulfilledAt: z.coerce.date().optional().nullable(),
  metadata: z.union([ z.lazy(() => NullableJsonNullValueInputSchema),InputJsonValueSchema ]).optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  order: z.lazy(() => OrderCreateNestedOneWithoutItemsInputSchema),
  product: z.lazy(() => ProductCreateNestedOneWithoutOrderItemsInputSchema).optional(),
  variant: z.lazy(() => ProductCreateNestedOneWithoutOrderItemVariantsInputSchema).optional(),
  registry: z.lazy(() => RegistryCreateNestedOneWithoutOrderItemsInputSchema).optional()
}).strict();

export default OrderItemCreateInputSchema;
