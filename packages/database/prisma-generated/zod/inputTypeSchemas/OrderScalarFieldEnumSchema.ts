import { z } from 'zod';

export const OrderScalarFieldEnumSchema = z.enum([
  'id',
  'orderNumber',
  'userId',
  'guestEmail',
  'guestName',
  'status',
  'shippingAddressId',
  'billingAddressId',
  'currency',
  'subtotal',
  'taxAmount',
  'shippingAmount',
  'discountAmount',
  'total',
  'shippingMethod',
  'trackingNumber',
  'shippedAt',
  'deliveredAt',
  'paymentStatus',
  'paymentMethod',
  'customerNotes',
  'internalNotes',
  'metadata',
  'createdAt',
  'updatedAt',
  'deletedAt',
]);

export default OrderScalarFieldEnumSchema;
