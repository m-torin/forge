import { z } from 'zod';

export const OrderItemScalarFieldEnumSchema = z.enum([
  'id',
  'orderId',
  'productId',
  'variantId',
  'productName',
  'variantName',
  'sku',
  'quantity',
  'price',
  'total',
  'isGift',
  'giftMessage',
  'registryId',
  'status',
  'fulfilledAt',
  'metadata',
  'createdAt',
  'updatedAt',
]);

export default OrderItemScalarFieldEnumSchema;
