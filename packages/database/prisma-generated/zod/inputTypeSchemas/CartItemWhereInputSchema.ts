import { Prisma } from '../../client';
import Decimal from 'decimal.js';
import { z } from 'zod';
import { StringFilterSchema } from './StringFilterSchema';
import { StringNullableFilterSchema } from './StringNullableFilterSchema';
import { IntFilterSchema } from './IntFilterSchema';
import { DecimalFilterSchema } from './DecimalFilterSchema';
import { isValidDecimalInput } from './isValidDecimalInput';
import { DecimalJsLikeSchema } from './DecimalJsLikeSchema';
import { BoolFilterSchema } from './BoolFilterSchema';
import { JsonNullableFilterSchema } from './JsonNullableFilterSchema';
import { DateTimeFilterSchema } from './DateTimeFilterSchema';
import { CartScalarRelationFilterSchema } from './CartScalarRelationFilterSchema';
import { CartWhereInputSchema } from './CartWhereInputSchema';
import { ProductNullableScalarRelationFilterSchema } from './ProductNullableScalarRelationFilterSchema';
import { ProductWhereInputSchema } from './ProductWhereInputSchema';
import { RegistryNullableScalarRelationFilterSchema } from './RegistryNullableScalarRelationFilterSchema';
import { RegistryWhereInputSchema } from './RegistryWhereInputSchema';

export const CartItemWhereInputSchema: z.ZodType<Prisma.CartItemWhereInput> = z.object({
  AND: z.union([ z.lazy(() => CartItemWhereInputSchema),z.lazy(() => CartItemWhereInputSchema).array() ]).optional(),
  OR: z.lazy(() => CartItemWhereInputSchema).array().optional(),
  NOT: z.union([ z.lazy(() => CartItemWhereInputSchema),z.lazy(() => CartItemWhereInputSchema).array() ]).optional(),
  id: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  cartId: z.union([ z.lazy(() => StringFilterSchema),z.string() ]).optional(),
  productId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  variantId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  quantity: z.union([ z.lazy(() => IntFilterSchema),z.number() ]).optional(),
  price: z.union([ z.lazy(() => DecimalFilterSchema),z.union([z.number(),z.string(),z.instanceof(Decimal),z.instanceof(Prisma.Decimal),DecimalJsLikeSchema,]).refine((v) => isValidDecimalInput(v), { message: 'Must be a Decimal' }) ]).optional(),
  isGift: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  giftMessage: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  registryId: z.union([ z.lazy(() => StringNullableFilterSchema),z.string() ]).optional().nullable(),
  savedForLater: z.union([ z.lazy(() => BoolFilterSchema),z.boolean() ]).optional(),
  metadata: z.lazy(() => JsonNullableFilterSchema).optional(),
  createdAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  updatedAt: z.union([ z.lazy(() => DateTimeFilterSchema),z.coerce.date() ]).optional(),
  cart: z.union([ z.lazy(() => CartScalarRelationFilterSchema),z.lazy(() => CartWhereInputSchema) ]).optional(),
  product: z.union([ z.lazy(() => ProductNullableScalarRelationFilterSchema),z.lazy(() => ProductWhereInputSchema) ]).optional().nullable(),
  variant: z.union([ z.lazy(() => ProductNullableScalarRelationFilterSchema),z.lazy(() => ProductWhereInputSchema) ]).optional().nullable(),
  registry: z.union([ z.lazy(() => RegistryNullableScalarRelationFilterSchema),z.lazy(() => RegistryWhereInputSchema) ]).optional().nullable(),
}).strict();

export default CartItemWhereInputSchema;
