/**
 * Order Type Definitions
 */

export interface TAddress {
  id: string;
  firstName: string;
  lastName: string;
  company: string | null;
  phone: string | null;
  street1: string;
  street2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface TOrderItem {
  id: string;
  productId: string;
  variantId: string | null;
  productName: string;
  variantName: string | null;
  sku: string | null;
  quantity: number;
  price: number;
  total: number;
  isGift: boolean;
  giftMessage: string | null;
  registryId: string | null;
  status: 'PENDING' | 'PROCESSING' | 'FULFILLED' | 'CANCELLED' | 'REFUNDED';
  fulfilledAt: Date | null;
  product?: {
    id: string;
    image: string | null;
    slug: string;
  };
}

export interface TTransaction {
  id: string;
  type: 'PAYMENT' | 'REFUND' | 'PARTIAL_REFUND' | 'VOID';
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  amount: number;
  currency: string;
  gateway: string;
  paymentMethod: string | null;
  last4: string | null;
  processedAt: Date | null;
  failedAt: Date | null;
  failureReason: string | null;
  createdAt: Date;
}

export interface TOrder {
  id: string;
  orderNumber: string;
  userId: string | null;
  guestEmail: string | null;
  guestName: string | null;
  status:
    | 'PENDING'
    | 'CONFIRMED'
    | 'PROCESSING'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'CANCELLED'
    | 'REFUNDED'
    | 'FAILED';
  paymentStatus:
    | 'PENDING'
    | 'PROCESSING'
    | 'PAID'
    | 'PARTIALLY_PAID'
    | 'FAILED'
    | 'REFUNDED'
    | 'PARTIALLY_REFUNDED'
    | 'CANCELLED';
  currency: string;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  discountAmount: number;
  total: number;
  shippingMethod: string | null;
  trackingNumber: string | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  paymentMethod: string | null;
  customerNotes: string | null;
  shippingAddress: TAddress | null;
  billingAddress: TAddress | null;
  items: TOrderItem[];
  transactions: TTransaction[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TOrderSummary {
  order: {
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    total: number;
    createdAt: Date;
  };
  items: {
    total: number;
    fulfilled: number;
    pending: number;
  };
  payment: {
    totalPaid: number;
    totalRefunded: number;
    totalPending: number;
    balance: number;
  };
  transactions: {
    successful: number;
    pending: number;
    failed: number;
  };
}

// Note: TProductItem is defined in index.ts and should not be confused with TOrderItem
